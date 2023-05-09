import { getUrlParts } from '@automattic/calypso-url';
import displayTypes from 'calypso/state/reader/posts/display-types';

const { X_POST } = displayTypes;

export function isXPost( post ) {
	return post && ( post.display_type & X_POST || post.tags?.hasOwnProperty( 'p2-xpost' ) );
}

const exported = {
	/**
	 * Examines the post metadata, and returns metadata related to cross posts.
	 *
	 * @param {Object} post - post object
	 * @returns {Object} - urls of site and post url
	 */
	getXPostMetadata( post ) {
		if ( ! isXPost( post ) ) {
			return null;
		}

		const xPostMetadata = {
			siteURL: null,
			postURL: null,
			commentURL: null,
			blogId: null,
			postId: null,
		};
		if ( post && post.metadata ) {
			const keys = Object.keys( post.metadata );
			for ( let i = 0; i < keys.length; i++ ) {
				const meta = post.metadata[ keys[ i ] ];
				if (
					meta.key === '_xpost_original_permalink' ||
					meta.key === 'xcomment_original_permalink'
				) {
					const urlParts = getUrlParts( meta.value );
					xPostMetadata.siteURL = `${ urlParts.protocol }//${ urlParts.host }`;
					xPostMetadata.postURL = `${ xPostMetadata.siteURL }${ urlParts.pathname }`;
					if ( urlParts.hash && urlParts.hash.indexOf( '#comment-' ) === 0 ) {
						xPostMetadata.commentURL = meta.value;
					}
				} else if ( meta.key === 'xpost_origin' ) {
					const ids = meta.value.split( ':' );
					xPostMetadata.blogId = +ids[ 0 ];
					xPostMetadata.postId = +ids[ 1 ];
				}
			}
		}
		return xPostMetadata;
	},
};

export default exported;

export const { getXPostMetadata } = exported;
