import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { getQueryArgs } from '@wordpress/url';
import { isEditorReady } from '../../utils';

const { url, title, text, comment_content, comment_author, answer_prompt } = getQueryArgs(
	window.location.href
);

if ( url ) {
	( async () => {
		// Wait for the editor to be initialized and the core blocks registered.
		await isEditorReady();

		const blocks = [];

		if ( text && text !== title ) {
			const link = `<a href="${ url }">${ title }</a>`;
			blocks.push(
				createBlock( 'core/quote', {
					value: `<p>${ text }</p>`,
					citation: link,
				} )
			);
		}

		if ( comment_content ) {
			blocks.push(
				createBlock( 'core/quote', { value: comment_content, citation: comment_author } )
			);
		}

		blocks.push( createBlock( 'core/embed', { url, type: 'wp-embed' } ) );

		dispatch( 'core/editor' ).resetEditorBlocks( blocks );
	} )();
}

if ( answer_prompt ) {
	( async () => {
		await isEditorReady();

		// If answer_prompt is strictly true, initiate the block with no promptId so it fetches the
		// prompt for the day. Otherwise, if truthy we assume it as the promptId.
		const blockProps = answer_prompt === true ? {} : { promptId: answer_prompt };

		dispatch( 'core/editor' ).resetEditorBlocks( [
			createBlock( 'jetpack/blogging-prompt', blockProps ),
		] );
	} )();
}
