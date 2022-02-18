import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { getQueryArgs } from '@wordpress/url';
import { isEditorReady } from '../../utils';

const { url, title, text, image, embed } = getQueryArgs( window.location.href );

if ( url ) {
	( async () => {
		// Wait for the editor to be initialized and the core blocks registered.
		await isEditorReady();

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
	} )();
}
