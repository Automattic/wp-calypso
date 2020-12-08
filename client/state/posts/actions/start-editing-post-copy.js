/**
 * External dependencies
 */
import { includes, pick, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { getFeaturedImageId } from 'calypso/state/posts/utils';
import {
	editorSetLoadingError,
	startEditingNewPost,
	startEditingPost,
} from 'calypso/state/editor/actions';

import 'calypso/state/posts/init';

export const startEditingPostCopy = ( siteId, postToCopyId ) => ( dispatch ) => {
	dispatch( startEditingPost( siteId, null ) );

	wpcom
		.site( siteId )
		.post( postToCopyId )
		.get( { context: 'edit' } )
		.then( ( postToCopy ) => {
			const postAttributes = pick( postToCopy, [
				'canonical_image',
				'content',
				'excerpt',
				'format',
				'post_thumbnail',
				'terms',
				'type',
			] );

			postAttributes.title = decodeEntities( postToCopy.title );
			postAttributes.featured_image = getFeaturedImageId( postToCopy );

			/**
			 * A list of allowed post metadata for the `updatePostMetadata()` action.
			 *
			 * This is needed because blindly passing all post metadata to `editPost()`
			 * causes unforeseeable issues, such as Publicize not triggering on the copied post.
			 *
			 * @see https://github.com/Automattic/wp-calypso/issues/14840
			 */
			const allowedMetadata = [ 'geo_latitude', 'geo_longitude', 'geo_address', 'geo_public' ];

			// Filter the post metadata to include only the ones we want to copy,
			// use only the `key` and `value` properties (and, most importantly exclude `id`),
			// and add an `operation` field to the copied values.
			const copiedMetadata = reduce(
				postToCopy.metadata,
				( copiedMeta, { key, value } ) => {
					if ( includes( allowedMetadata, key ) ) {
						copiedMeta.push( { key, value, operation: 'update' } );
					}
					return copiedMeta;
				},
				[]
			);

			if ( copiedMetadata.length > 0 ) {
				postAttributes.metadata = copiedMetadata;
			}

			dispatch( startEditingNewPost( siteId, postAttributes ) );
		} )
		.catch( ( error ) => {
			dispatch( editorSetLoadingError( error ) );
		} );
};
