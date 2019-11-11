/**
 * External dependencies
 */
import { flowRight as compose, get, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import { fromApi as seoTitleFromApi } from 'components/seo/meta-title-editor/mappings';

/**
 * Returns object describing custom title format
 * strings for SEO given a site object.
 *
 * @see client/components/seo/meta-title-editor
 *
 * @param  {Object} site Selected site
 * @return {Object} Formats by type e.g. { frontPage: { type: 'siteName' } }
 */
export default compose(
	seoTitleFromApi,
	partialRight( get, 'options.advanced_seo_title_formats', {} )
);
