import 'dotenv/config.js'; // eslint-disable-line import/no-unassigned-import
import {Indiekit} from './packages/indiekit/index.js';
import {JekyllPreset} from './packages/preset-jekyll/index.js';
import {BitbucketStore} from './packages/store-bitbucket/index.js';
import {InternetArchiveSyndicator} from './packages/syndicator-internet-archive/index.js';

// New indiekit instance
const indiekit = new Indiekit();

// Configure publication preset
const jekyll = new JekyllPreset();

// Configure content store
const bitbucket = new BitbucketStore({
  user: process.env.BITBUCKET_USER,
  repo: process.env.BITBUCKET_REPO,
  branch: process.env.BITBUCKET_BRANCH,
  auth: {
    appName: process.env.BITBUCKET_APPNAME,
    key: process.env.BITBUCKET_KEY,
    secret: process.env.BITBUCKET_SECRET
  }
});

// Configure Internet Archive syndicator
const internetArchive = new InternetArchiveSyndicator({
  accessKey: process.env.ARCHIVE_ACCESS_KEY,
  secret: process.env.ARCHIVE_SECRET
});

// Application settings
indiekit.set('application.mongodbUrl', process.env.MONGODB_URL);

// Publication settings
indiekit.set('publication.me', process.env.PUBLICATION_URL);
indiekit.set('publication.preset', jekyll);
indiekit.set('publication.store', bitbucket);
indiekit.set('publication.timeZone', process.env.TZ ? process.env.TZ : 'UTC');
indiekit.set('publication.syndicationTargets', [internetArchive]);

// Server
const server = indiekit.server();

export default server;
