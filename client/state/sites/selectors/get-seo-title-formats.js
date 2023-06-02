import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSeoTitleFormatsForSite from './get-seo-title-formats-for-site';

/**
 * Returns object describing custom title format
 * strings for SEO.
 *
 * @see client/components/seo/meta-title-editor
 * @param  {Object} state  Global app state
 * @param  {number} siteId Selected site
 * @returns {Object} Formats by type e.g. { frontPage: { type: 'siteName' } }
 */
export default ( state, siteId ) => getSeoTitleFormatsForSite( getRawSite( state, siteId ) );
