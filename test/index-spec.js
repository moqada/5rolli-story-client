import fs from 'fs';
import path from 'path';
import assert from 'power-assert';
import nock from 'nock';
import StoryClient from '../src';

const fixtureDir = path.resolve(__dirname, './fixtures');

describe('StoryClient', () => {
  let mockServer = null;
  let client = null;
  const dummyId = 'dummyId';

  beforeEach(() => {
    mockServer = nock('https://api.trello.com');
    client = new StoryClient('dummy', 'dummy', dummyId);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('is defined', () => {
    assert(StoryClient);
  });

  it('#getStories()', () => {
    const response = JSON.parse(
      fs.readFileSync(path.join(fixtureDir, 'response-board.json'), 'utf8')
    );
    let expected = JSON.parse(
      fs.readFileSync(path.join(fixtureDir, 'expect-stories.json'), 'utf8')
    );
    expected = expected.map(s => {
      if (s.sprint) {
        const sprint = Object.assign({}, s.sprint, {due: new Date(s.sprint.due)});
        return Object.assign({}, s, {sprint});
      }
      return s;
    });
    mockServer
      .get(`/1/boards/${dummyId}`)
      .query(true)
      .reply(200, response);
    return client.getStories().then(stories => assert.deepEqual(stories, expected));
  });
});
