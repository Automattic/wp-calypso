import { createBlock } from '@wordpress/blocks';
import { dispatch, select, subscribe } from '@wordpress/data';
import { getQueryArgs } from '@wordpress/url';

const { url, title, text, image, embed } = getQueryArgs( window.location.href );

if ( url ) {
	const unsubscribe = subscribe( () => {
		// We need to be sure that the editor is initialized and the core blocks
		// registered. There is an unstable selector for that, so we use
		// `isCleanNewPost` otherwise which is triggered when everything is
		// initialized if the post is new.
		const editorIsReady = select( 'core/editor' ).__unstableIsEditorReady
			? select( 'core/editor' ).__unstableIsEditorReady()
			: select( 'core/editor' ).isCleanNewPost();
		if ( ! editorIsReady ) {
			return;
		}

		unsubscribe();

		const link = `<a href="${ url }">${ title }</a>`;

		const blocks = [];

		if ( embed ) {
			blocks.push( createBlock( 'core/embed', { url: embed } ) );
		}

		if ( image ) {
			blocks.push(
				createBlock( 'core/image', {
					url: image,
					caption: text ? '' : link,
				} )
			);
		}

		if ( text ) {
			blocks.push(
				createBlock( 'core/quote', {
					value: `<p>${ text }</p>`,
					citation: link,
				} )
			);
		}

		dispatch( 'core/editor' ).resetEditorBlocks( blocks );
		dispatch( 'core/editor' ).editPost( { title: title } );
	} );
}
