/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import { editPost } from 'state/posts/actions';
import { setEditorPostId } from 'state/ui/editor/actions';
import wpcom from 'lib/wp';

function setPostCopy( post ) {
	const postCopy = {
		options: {
			type: 'post',
			content: post.content,
		},
		attributes: {
			categories: Object.keys( post.categories ).map( key => post.categories[ key ].ID ),
			excerpt: post.excerpt,
			tags: Object.keys( post.tags ).map( key => post.tags[ key ].name ),
			title: post.title,
		},
	};

	if ( post.canonical_image ) {
		postCopy.attributes.canonical_image = post.canonical_image;
	}
	if ( post.featured_image ) {
		postCopy.attributes.featured_image = post.featured_image;
	}
	if ( post.format ) {
		postCopy.attributes.format = post.format;
	}
	if ( post.metadata ) {
		postCopy.attributes.metadata = post.metadata;
	}
	if ( post.post_thumbnail ) {
		postCopy.attributes.post_thumbnail = post.post_thumbnail;
	}

	return postCopy;
}

export function startEditingPostCopy( context, siteId, postId ) {
	return new Promise( ( resolve, reject ) => {
		wpcom.site( siteId ).post( postId ).get().then( post => {
			context.store.dispatch( setEditorPostId( null ) );
			context.store.dispatch( editPost( { type: 'post' }, siteId, null ) );

			const postCopy = setPostCopy( post );

			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.startEditingNew( siteId, postCopy.options ); // set content for TinyMCE

			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.edit( postCopy.attributes ); // set the other post attributes

			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			actions.autosave(); // force an autosave to display the attributes

			resolve();
		} ).catch( error => {
			reject( error );
		} );
	} );
}
