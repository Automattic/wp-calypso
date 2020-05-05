/**
 * External dependencies
 */
import { includes, pick, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import wpcom from 'lib/wp';
import { getFeaturedImageId } from 'state/posts/utils';
import {
	editorSetLoadingError,
	startEditingNewPost,
	startEditingPost,
} from 'state/ui/editor/actions';

import 'state/posts/init';

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
			 * A post metadata whitelist for the `updatePostMetadata()` action.
			 *
			 * This is needed because blindly passing all post metadata to `editPost()`
			 * causes unforeseeable issues, such as Publicize not triggering on the copied post.
			 *
			 * @see https://github.com/Automattic/wp-calypso/issues/14840
			 */
			const metadataWhitelist = [ 'geo_latitude', 'geo_longitude', 'geo_address', 'geo_public' ];

			// Filter the post metadata to include only the ones we want to copy,
			// use only the `key` and `value` properties (and, most importantly exclude `id`),
			// and add an `operation` field to the copied values.
			const copiedMetadata = reduce(
				postToCopy.metadata,
				( copiedMeta, { key, value } ) => {
					if ( includes( metadataWhitelist, key ) ) {
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
