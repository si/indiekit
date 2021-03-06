import Debug from 'debug';
import HttpError from 'http-errors';
import {fileURLToPath} from 'url';
import path from 'path';
import {internetArchive} from './lib/internet-archive.js';

export const debug = new Debug('indiekit:syndicator-internet-archive');
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaults = {
  checked: false,
  name: 'Internet Archive',
  uid: 'https://web.archive.org/'
};

export const InternetArchiveSyndicator = class {
  constructor(options = {}) {
    this.id = 'internet-archive';
    this.name = 'Internet Archive';
    this.options = {...defaults, ...options};
  }

  get assetsPath() {
    return path.join(__dirname, 'assets');
  }

  get info() {
    return {
      checked: this.options.checked,
      name: this.options.name,
      uid: this.options.uid,
      service: {
        name: 'Internet Archive',
        url: 'https://web.archive.org/',
        photo: '/assets/internet-archive/icon.svg'
      }
    };
  }

  get uid() {
    return this.info.uid;
  }

  async syndicate(postData) {
    if (!postData) {
      throw new Error('No post data given to syndicate');
    }

    try {
      // Make a capture request
      const {url} = postData.properties;
      debug(`Syndicating ${url} to the Internet Archive`);
      const capture = await internetArchive(this.options).capture(url);

      // Make a status request
      const {job_id} = capture;
      debug(`Capture of ${url} assigned to job ${job_id}`);
      const archive = await internetArchive(this.options).status(job_id);

      // Construct syndidated URL
      const {original_url, timestamp} = archive;
      const syndicatedUrl = `https://web.archive.org/web/${timestamp}/${original_url}`;

      // Ruturn successful syndication message
      return {
        location: syndicatedUrl,
        status: 200,
        json: {
          success: 'syndicate',
          success_description: `Post syndicated to ${syndicatedUrl}`
        }
      };
    } catch (error) {
      throw new HttpError(error);
    }
  }
};
