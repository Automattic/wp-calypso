/**
 * External dependencies
 */
import { filter, map, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePost } from 'state/posts/selectors';
import { requestSitePost } from 'state/posts/actions';
import { refreshByUid } from './utils';
import createPostStatResolver from './post-stat';
import { makeImageURLSafe } from 'lib/post-normalizer/utils';

const MAX_SAFE_IMAGE_WIDTH = 653;

export const resolvePost = ( store, post, context ) => {
	if ( ! post ) {
		return post;
	}
	return {
		...post,
		stat: ( { stat } ) => createPostStatResolver( store )( {
			siteId: post.site_ID,
			postId: post.ID,
			stat
		}, context ),

		// This images node is here to mimic PostContentImagesStore
		images: ( { minWidth, minHeight } ) => {
			const isValid = image =>
				startsWith( image.mime_type, 'image/' ) &&
				image.width >= minWidth &&
				image.height >= minHeight;

			return {
				featured_image: post.featured_image,
				canonical_image: () => {
					if ( ! post.canonical_image ) {
						return null;
					}
					makeImageURLSafe( post.canonical_image, 'uri', MAX_SAFE_IMAGE_WIDTH, post.URL );
					return {
						uri: post.canonical_image.uri
					};
				},
				images: () => map( filter( post.attachments, isValid ), image => {
					makeImageURLSafe( image, 'URL', MAX_SAFE_IMAGE_WIDTH, post.URL );
					return {
						src: image.URL
					};
				} ),
			};
		}
	};
};

const createResolver = store => ( args, { uid } ) => {
	const { siteId, postId } = args;
	refreshByUid( store, uid, 'post', args, () => {
		store.dispatch( requestSitePost( siteId, postId ) );
	} );
	const state = store.getState();
	const post = getSitePost( state, siteId, postId );
	return resolvePost( store, post, { uid } );
};

export default createResolver;
