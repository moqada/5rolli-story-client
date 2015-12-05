/* eslint camelcase: 0 */
// XXX: Trello APIパラメータでスネークケースを使用する必要があるためcamelcaseルールを解除
import request from 'superagent';

const NAME_BASE_REGEX = /^(\d+):\s+(?:\((?:(\d+)\/)?(\d+)\/(\d+)\)\s+)?(.*)$/;
const API_ENDPOINT = 'https://api.trello.com';
const AVATAR_ENDPOINT = 'https://trello-avatars.s3.amazonaws.com';
const STORY_TYPE = {
  issue: 'issue',
  story: 'story',
  invalid: 'invalid'
};
const STORY_STATUS = {
  open: 'open',
  close: 'close',
  waiting: 'waiting',
  unknown: 'unknown'
};

/**
 * @typedef {Object} Card
 *
 * @property {string} listName Trello list name
 * @property {string[]} labels Trello label name list
 * @property {number} pos Trello card position
 * @property {url} string Trello card url
 */

/**
 * @typedef {Object} Member
 *
 * @property {string} username Trello username
 * @property {string} ?avatarUrl Trello avatar url
 */

/**
 * @typedef {Object} Sprint
 *
 * @property {string} name sprint name
 * @property {Date} due sprint due date
 */

/**
 * @typedef {Object} Story
 *
 * @property {number} id story id
 * @property {string} title story title
 * @property {string} type story type
 * @property {string} status story status
 * @property {number} parentId parent story id
 * @property {number[]} dependIds depends story id
 * @property {Member[]} members member list
 * @property {Story[]} children children story list
 * @property {Sprint} sprint? sprint
 * @property {{spent: ?number, es50: ?number, es90: ?number}} time? time
 * @property {Card} card Trello card
 */

/**
 * @typedef {Object} Issue
 *
 * @property {number} id issue id
 * @property {string} title issue title
 * @property {string} type issue type
 * @property {string} status issue status
 * @property {number[]} dependIds depends story id
 * @property {Member[]} members member list
 * @property {Story[]} children children story list
 * @property {Card} card Trello card
 */

/**
 * @typedef {Object} InvalidStory
 *
 * @property {string} title story title
 * @property {string} type story type
 * @property {Card} card Trello card
 */

/**
 * @typedef {Story|InvalidStory|Issue} StoryNode
 */


/**
 * Story Client
 */
export default class StoryClient {

  /**
   * constructor
   *
   * @param {string} apiToken trello api token
   * @param {string} apiKey trello api key
   * @param {string} boardId trello board id
   */
  constructor(apiToken, apiKey, boardId) {
    this.boardId = boardId;
    this.apiToken = apiToken;
    this.apiKey = apiKey;
  }

  /**
   * Trello CardのnameからStoryの素オブジェクトに変換
   *
   * @param {string} name card name
   * @return {Object}
   */
  parseCardName(name) {
    const match = NAME_BASE_REGEX.exec(name);
    if (!match) {
      return {
        title: name,
        type: STORY_TYPE.invalid
      };
    }
    const [id, spent, es50, es90, body] = match.slice(1);
    const parentMatch = body.match(/\s+#(\d+)/);
    const dependsMatch = body.match(/\s+&(\d+)/g);
    const parentId = parentMatch && parseInt(parentMatch[1], 10);
    const baseStory = {
      id: parseInt(id, 10),
      title: body.replace(/(\s+#(\d+))|(\s+&(\d+))/g, '').trim(),
      dependIds: dependsMatch ? dependsMatch.map(m => parseInt(/\d+/.exec(m)[0], 10)) : []
    };
    if (parentId) {
      return Object.assign({}, baseStory, {
        parentId,
        type: STORY_TYPE.story,
        time: {
          spent: spent ? parseInt(spent, 10) : null,
          es50: es50 ? parseInt(es50, 10) : null,
          es90: es90 ? parseInt(es90, 10) : null
        }
      });
    }
    return Object.assign({}, baseStory, {
      type: STORY_TYPE.issue
    });
  }

  /**
   * Trello ListのnameからSprintに変換
   *
   * @param {string} name trello list name
   * @return {?Sprint}
   */
  parseListName(name) {
    const sprintMatches = /^Sprint\.\s*\d+\s*\((\d{4})(\d{2})(\d{2})\)/.exec(name);
    if (!sprintMatches) {
      return null;
    }
    const [year, month, day] = sprintMatches.slice(1).map(s => parseInt(s, 10));
    return {
      name,
      due: new Date(year, month - 1, day)
    };
  }

  /**
   * Trello CardとBoardデータからStoryに変換
   *
   * @param {Object} card Trello Card
   * @param {Object} board Trello Board
   * @return {StoryNode}
   */
  parseCard(card, board) {
    const story = this.parseCardName(card.name);
    const labels = card.labels.map(label => label.name);
    const members = card.idMembers.map(mid => {
      const member = board.members.find(m => m.id === mid);
      if (!member) {
        return null;
      }
      return {
        username: member.username,
        avatarUrl: member.avatarHash && `${AVATAR_ENDPOINT}/${member.avatarHash}/30.png`
      };
    }).filter(m => m);
    const list = board.lists.find(l => l.id === card.idList);
    const override = {
      members,
      status: labels.indexOf(STORY_STATUS.open) >= 0 ? STORY_STATUS.open : story.status,
      card: {
        labels,
        url: card.shortUrl,
        listName: list.name,
        pos: card.pos
      }
    };
    const sprint = this.parseListName(list.name);
    if (sprint) {
      return Object.assign({}, story, override, {sprint});
    }
    return Object.assign({}, story, override);
  }

  /**
   * Story 一覧を取得する
   *
   * @return {Promise<StoryNode[], null>}
   */
  getStories() {
    return new Promise((resolve, reject) => {
      request.get(`${API_ENDPOINT}/1/boards/${this.boardId}`)
        .query({
          cards: 'visible',
          card_fields: 'labels,name,shortUrl,pos,idList,idMembers',
          lists: 'open',
          members: 'all',
          member_fields: 'username,avatarHash',
          token: this.apiToken,
          key: this.apiKey
        })
        .end((err, res) => {
          if (err) {
            return reject(err);
          }
          const stories = res.body.cards.map(card => {
            return this.parseCard(card, res.body);
          });
          resolve(stories);
        });
    });
  }
}
