import bitbucket from 'bitbucket';
import bitbucketAuth from 'bitbucket-auth';

const defaults = {
  branch: 'master',
  messageFormat: '{action} {postType} {fileType}'
};

/**
 * @typedef Response
 * @property {object} response HTTP response
 */
export const BitbucketStore = class {
  constructor(options = {}) {
    this.id = 'bitbucket';
    this.name = 'Bitbucket';
    this.options = {...defaults, ...options};
  }

  get messageFormat() {
    return this.options.messageFormat;
  }

  async getAccessToken() {
    const {getAccessToken} = bitbucketAuth;
    const accessToken = await getAccessToken({
      appName: this.options.auth.appName,
      consumerKey: this.options.auth.key,
      consumerSecret: this.options.auth.secret,
      credentialsProvider: () => ({
        username: this.options.auth.key,
        password: this.options.auth.secret
      }),
      logging: true
    });
    console.log('accessToken', accessToken);

    return accessToken;
  }

  async bitbucket() {
    const {Bitbucket} = bitbucket;
    return new Bitbucket({
      auth: {
        token: await this.getAccessToken()
      }
    });
  }

  /**
   * Create file in a repository
   *
   * @param {string} path Path to file
   * @param {string} content File content
   * @param {string} message Commit message
   * @returns {Promise<Response>} A promise to the response
   * @see https://bitbucketjs.netlify.app/#api-repositories-repositories_createSrcFileCommit
   */
  async createFile(path, content, message) {
    content = Buffer.from(content).toString('base64');
    const response = await this.bitbucket().repositories.createSrcFileCommit({
      workspace: this.options.user,
      repo_slug: this.options.repo,
      branch: this.options.branch,
      message,
      path,
      content
    });
    return response;
  }

  /**
   * Read file in a repository
   *
   * @param {string} path Path to file
   * @returns {Promise<Response>} A promise to the response
   * @see https://bitbucketjs.netlify.app/#api-repositories-repositories_readSrc
   */
  async readFile(path) {
    const response = await this.bitbucket().repositories.readSrc({
      workspace: this.options.user,
      repo_slug: this.options.repo,
      ref: this.options.branch,
      path
    });
    const content = Buffer.from(response.data.content, 'base64').toString('utf8');
    return content;
  }

  /**
   * Update file in a repository
   *
   * @param {string} path Path to file
   * @param {string} content File content
   * @param {string} message Commit message
   * @returns {Promise<Response>} A promise to the response
   */
  async updateFile(path, content, message) {
    const contents = await this.bitbucket().repositories.readSrc({
      workspace: this.options.user,
      repo_slug: this.options.repo,
      ref: this.options.branch,
      path
    }).catch(() => {
      return false;
    });

    content = Buffer.from(content).toString('base64');
    const response = await this.bitbucket().repositories.createOrUpdateFileContents({
      workspace: this.options.user,
      repo_slug: this.options.repo,
      branch: this.options.branch,
      sha: (contents) ? contents.data.sha : false,
      message,
      path,
      content
    });
    return response;
  }

  /**
   * Delete file in a repository
   *
   * @param {string} path Path to file
   * @param {string} message Commit message
   * @returns {Promise<Response>} A promise to the response
   * @see https://developer.github.com/v3/repos/contents/#delete-a-file
   */
  async deleteFile(path, message) {
    const contents = await this.bitbucket().repositories.readSrc({
      workspace: this.options.user,
      repo_slug: this.options.repo,
      ref: this.options.branch,
      path
    });
    const response = await this.bitbucket().repositories.deleteFile({
      owner: this.options.user,
      repo: this.options.repo,
      branch: this.options.branch,
      sha: contents.data.sha,
      message,
      path
    });
    return response;
  }
};
