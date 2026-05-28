import { addFilter } from '@wordpress/hooks';
import { withJetpackAiToolbarButton } from './block-toolbar-extension';

let filtersRegistered = false;

export function registerBlockEditorFilters(): void {
	if ( filtersRegistered ) {
		return;
	}
	filtersRegistered = true;

	addFilter( 'editor.BlockEdit', 'jetpack-ai-sidebar/block-toolbar', withJetpackAiToolbarButton );
}
