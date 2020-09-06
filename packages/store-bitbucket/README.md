# @indiekit/store-bitbucket

Store IndieWeb content on Bitbucket.

## Installation

`npm i @indiekit/store-bitbucket`

## Configuration

```js
const BitbucketStore = require('@indiekit/store-bitbucket');

const bitbucket = new BitbucketStore({
  // config options here
});
```

### Options

* `token`: Bitbucket access token. **Required**.
* `user`: Bitbucket username. **Required**.
* `repo`: Bitbucket repository. **Required**.
* `branch`: Bitbucket branch files are saved to. *Optional*, defaults to `master`.
