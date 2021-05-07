/**
 * External dependencies
 */
import { find } from 'lodash';
import { getThemeIdFromStylesheet } from 'calypso/state/themes/utils';

function getValueByKey( metadata, key ) {
	const meta = find( metadata, { key: key } );

	if ( meta ) {
		return meta.value;
	}
}

const PostMetadata = {
	/**
	 * Given a post object, returns the theme id of a template-first theme, or `undefined` if the value
	 * cannot be determined.
	 *
	 * @param  {object} post Post object
	 * @returns {string|undefined} ThemeId on success.
	 */
	homepageTemplate: function ( post ) {
		if ( ! post ) {
			return;
		}

		return getThemeIdFromStylesheet( getValueByKey( post.metadata, '_tft_homepage_template' ) );
	},

	/**
	 * Given a post object, returns the custom post meta description for
	 * the post, or undefined if it is has not been set.
	 *
	 * @param  {object} post Post object
	 * @returns {string}      Custom post meta description
	 */
	metaDescription: function ( post ) {
		if ( ! post ) {
			return;
		}

		return getValueByKey( post.metadata, 'advanced_seo_description' );
	},
};

export default PostMetadata;
