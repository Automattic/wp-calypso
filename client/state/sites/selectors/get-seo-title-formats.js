/**
 * External dependencies
 */
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';
import getSeoTitleFormatsForSite from './get-seo-title-formats-for-site';

/**
 * Returns object describing custom title format
 * strings for SEO.
 *
 * @see client/components/seo/meta-title-editor
 *
 * @param  {Object} state  Global app state
 * @param  {Number} siteId Selected site
 * @return {Object} Formats by type e.g. { frontPage: { type: 'siteName' } }
 */
export default compose(
	getSeoTitleFormatsForSite,
	getRawSite
);
