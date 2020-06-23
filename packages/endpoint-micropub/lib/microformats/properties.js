import path from 'path';
import luxon from 'luxon';
import slugify from '@sindresorhus/slugify';
import {
  excerptString,
  randomString
} from '../utils.js';

const {DateTime} = luxon;

/**
 * Derive content (HTML, else object value, else property value)
 *
 * @param {object} mf2 Microformats2 object
 * @returns {Array} Content
 */
export const getContent = mf2 => {
  let {content} = mf2.properties;

  if (content) {
    content = content[0].html || content[0].value || content[0];
    return new Array(content);
  }

  return null;
};

/**
 * Derive a permalink (by combining publication URL, that may include a
 * path, with the path to a post or file
 *
 * @param {object} url URL
 * @param {object} pathname Permalink path
 * @returns {string} Returns either 'photo', 'video' or audio
 * @example permalink('http://foo.bar/baz', '/qux/quux') =>
 *   'http://foo.bar/baz/qux/quux'
 */
export const getPermalink = (url, pathname) => {
  url = new URL(url);
  let permalink = path.join(url.pathname, pathname);
  permalink = new URL(permalink, url).href;

  return permalink;
};

/**
 * Derive published date (based on microformats2 data, else current date)
 *
 * @param {object} mf2 Microformats2 object
 * @param {object} locale Locale to use for formatting datetime
 * @param {object} zone Timezone offset
 * @returns {Array} Array containing ISO formatted date
 */
export const getPublishedDate = (mf2, locale = 'en-GB', zone = 'utc') => {
  const now = new Array(DateTime.local().toISO());
  const published = mf2.properties.published || now;
  const date = DateTime.fromISO(published[0], {
    locale,
    zone
  }).toISO();

  return new Array(date);
};

/**
 * Derive slug (using `mp-slug` value, slugified name else a random number)
 *
 * @param {object} mf2 Microformats2 object
 * @param {string} separator Slug separator
 * @returns {Array} Array containing slug value
 */
export const getSlug = (mf2, separator) => {
  // Use provided slug…
  const {slug} = mf2.properties;
  if (slug && slug[0] !== '') {
    return slug;
  }

  // …else, slugify name…
  const {name} = mf2.properties;
  if (name && name[0] !== '') {
    const excerptName = excerptString(name[0], 5);
    const nameSlug = slugify(excerptName, {
      replacement: separator,
      lower: true
    });

    return new Array(nameSlug);
  }

  // …else, failing that, create a random string
  // TODO: Explore using NewBase60 instead (requires post counter)
  const randomSlug = randomString();
  return new Array(randomSlug);
};