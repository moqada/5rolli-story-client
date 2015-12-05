# 5rolli-story-client

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download-image]][npm-download-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![DevDependency Status][daviddm-dev-image]][daviddm-dev-url]
[![License][license-image]][license-url]

Story Client for 5ROLLI


## Installation

```
npm install --save 5rolli-story-client
```


## Usage

```javascript
import StoryClient from '5rolli-story-client';

const client = new StoryClient('<trelloApiToken>', '<trelloApiKey>', '<trelloBoardId>');
client.getStories().then(stories => {
  console.log(stories);
});
// [
//   {
//     "id": 1,
//     "title": "導入画面",
//     "dependIds": [],
//     "type": "issue",
//     "members": [],
//     "status": "open",
//     "card": {
//       "labels": [
//         "issue",
//         "open"
//       ],
//       "url": "https://trello.com/c/111111",
//       "listName": "Issues",
//       "pos": 131072
//     }
//   },
//   {
//     "id": 11,
//     "title": "いい画面",
//     "dependIds": [],
//     "type": "issue",
//     "members": [],
//     "status": "open",
//     "card": {
//       "labels": [
//         "issue",
//         "open"
//       ],
//       "url": "https://trello.com/c/222222",
//       "listName": "Issues",
//       "pos": 212992
//     }
//   },
//   {
//     "id": 3,
//     "title": "ユーザはいい画面へ遷移できる",
//     "dependIds": [
//       10,
//       20
//     ],
//     "parentId": 1,
//     "type": "story",
//     "time": {
//       "spent": null,
//       "es50": 80,
//       "es90": 170
//     },
//     "members": [
//       {
//         "username": "moqada",
//         "avatarUrl": "https://trello-avatars.s3.amazonaws.com/e224a7409ad3fc91a94cbc9ca9fae632/30.png"
//       }
//     ],
//     "status": "open",
//     "card": {
//       "labels": [
//         "open"
//       ],
//       "url": "https://trello.com/c/44444444",
//       "listName": "Sprint. 1 (20151130)",
//       "pos": 163840
//     },
//     "sprint": {
//       "name": "Sprint. 1 (20151130)",
//       "due": "2015-11-29T15:00:00.000Z"
//     }
//   },
//   {
//     "title": "あかんやつ",
//     "type": "invalid",
//     "members": [],
//     "status": "open",
//     "card": {
//       "labels": [
//         "issue",
//         "open"
//       ],
//       "url": "https://trello.com/c/999999",
//       "listName": "inbox",
//       "pos": 3457999
//     }
//   }
// ]
```

[npm-url]: https://www.npmjs.com/package/5rolli-story-client
[npm-image]: https://img.shields.io/npm/v/5rolli-story-client.svg?style=flat-square
[npm-download-url]: https://www.npmjs.com/package/5rolli-story-client
[npm-download-image]: https://img.shields.io/npm/dt/5rolli-story-client.svg?style=flat-square
[travis-url]: https://travis-ci.org/moqada/5rolli-story-client
[travis-image]: https://img.shields.io/travis/moqada/5rolli-story-client.svg?style=flat-square
[daviddm-url]: https://david-dm.org/moqada/5rolli-story-client
[daviddm-image]: https://img.shields.io/david/moqada/5rolli-story-client.svg?style=flat-square
[daviddm-dev-url]: https://david-dm.org/moqada/5rolli-story-client#info=devDependencies
[daviddm-dev-image]: https://img.shields.io/david/dev/moqada/5rolli-story-client.svg?style=flat-square
[codecov-url]: https://codecov.io/github/moqada/5rolli-story-client
[codecov-image]: https://img.shields.io/codecov/c/github/moqada/5rolli-story-client.svg?style=flat-square
[license-url]: http://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/5rolli-story-client.svg?style=flat-square
