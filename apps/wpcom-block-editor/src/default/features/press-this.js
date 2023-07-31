import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { getQueryArgs } from '@wordpress/url';
import { isEditorReady } from '../../utils';

const { url, comment_content, comment_author } = getQueryArgs( window.location.href );

if ( url ) {
	( async () => {
		// Wait for the editor to be initialized and the core blocks registered.
		await isEditorReady();

		const blocks = [];

		if ( comment_content ) {
			blocks.push(
				createBlock( 'core/quote', { value: comment_content, citation: comment_author } )
			);
		}

		blocks.push( createBlock( 'core/embed', { url, type: 'wp-embed' } ) );

		dispatch( 'core/editor' ).resetEditorBlocks( blocks );
	} )();
}
