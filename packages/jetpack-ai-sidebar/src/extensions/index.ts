import { addFilter } from '@wordpress/hooks';
import { isBlockToolbarButtonEnabled } from '../utils/preview-features';
import { withJetpackAiToolbarButton } from './block-toolbar-extension';

let filtersRegistered = false;

export function registerBlockEditorFilters(): void {
	if ( filtersRegistered ) {
		return;
	}

	// Skip wrapping every block's edit component when the toolbar button is
	// disabled (the default). The host injects `agentsManagerData` before this
	// bundle runs, so the flag is readable at registration time. The guard is
	// set only after registering, so a later call can still register if the
	// flag was not yet available.
	if ( ! isBlockToolbarButtonEnabled() ) {
		return;
	}

	filtersRegistered = true;
	addFilter( 'editor.BlockEdit', 'jetpack-ai-sidebar/block-toolbar', withJetpackAiToolbarButton );
}
