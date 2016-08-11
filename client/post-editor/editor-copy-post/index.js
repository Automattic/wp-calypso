/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import { editPost } from 'state/posts/actions';
import { setEditorPostId } from 'state/ui/editor/actions';
import { map, pick } from 'lodash';
import wpcom from 'lib/wp';

function setPostCopy( post ) {
	const postCopy = {
		options: {
			type: 'post',
			content: post.content,
		},
		attributes: {},
	};

	postCopy.attributes = pick(
		post,
		'canonical_image',
		'excerpt',
		'featured_image',
		'format',
		'metadata',
		'post_thumbnail',
		'title'
	);
	postCopy.attributes.categories = map( post.categories, 'ID' );
	postCopy.attributes.tags = map( post.tags, 'name' );

	return postCopy;
}

export function startEditingPostCopy( context, siteId, postId ) {
	wpcom.site( siteId ).post( postId ).get().then( post => {
		context.store.dispatch( setEditorPostId( null ) );
		context.store.dispatch( editPost( { type: 'post' }, siteId, null ) );

		const postCopy = setPostCopy( post );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.startEditingNew( siteId, postCopy.options ); // set content for TinyMCE

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		actions.edit( postCopy.attributes ); // set the other post attributes
	} );
}
