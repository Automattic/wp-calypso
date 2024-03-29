import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { getQueryArgs } from '@wordpress/url';
import { isEditorReady } from '../../utils';

const { answer_prompt } = getQueryArgs( window.location.href );

if ( answer_prompt ) {
	( async () => {
		await isEditorReady();

		dispatch( 'core/editor' ).resetEditorBlocks( [
			createBlock( 'jetpack/blogging-prompt', { promptId: answer_prompt } ),
		] );
	} )();
}
