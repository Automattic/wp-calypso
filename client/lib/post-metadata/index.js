/**
 * External dependencies
 */
import { find } from 'lodash';

function getValueByKey( metadata, key ) {
	const meta = find( metadata, { key: key } );

	if ( meta ) {
		return meta.value;
	}
}

const PostMetadata = {
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
