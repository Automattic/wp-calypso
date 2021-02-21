/**
 * External dependencies
 */
import { flowRight as compose, get, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import { fromApi as seoTitleFromApi } from 'calypso/components/seo/meta-title-editor/mappings';

/**
 * Returns object describing custom title format
 * strings for SEO given a site object.
 *
 * @see client/components/seo/meta-title-editor
 *
 * @param  {object} site Selected site
 * @returns {object} Formats by type e.g. { frontPage: { type: 'siteName' } }
 */
export default compose(
	seoTitleFromApi,
	partialRight( get, 'options.advanced_seo_title_formats', {} )
);
