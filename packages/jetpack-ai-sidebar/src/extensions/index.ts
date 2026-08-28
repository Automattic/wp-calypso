import { addFilter } from '@wordpress/hooks';
import { isBlockToolbarButtonEnabled, isDraftAssistEnabled } from '../utils/preview-features';
import { withJetpackAiToolbarButton } from './block-toolbar-extension';
import { registerDraftEntry } from './draft-entry';
import { withDraftAssistPlaceholder } from './draft-placeholder';

let filtersRegistered = false;
let draftPlaceholderRegistered = false;

function registerBlockToolbarFilter(): void {
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

function registerDraftPlaceholderFilter(): void {
	if ( draftPlaceholderRegistered ) {
		return;
	}

	// Gate registration on the flag, like registerBlockToolbarFilter() above.
	// This HOC wraps EVERY block's edit component, and measured at 2,000 blocks it
	// made store ticks 24-35x slower. Registering it for users who cannot use the
	// feature meant ~100% of editor users paying that and 0% getting anything.
	// registerDraftEntry() already reads the flag at registration time, so the
	// "cannot lose a race against agentsManagerData" argument does not hold here.
	if ( ! isDraftAssistEnabled() ) {
		return;
	}

	draftPlaceholderRegistered = true;
	addFilter(
		'editor.BlockEdit',
		'jetpack-ai-sidebar/draft-placeholder',
		withDraftAssistPlaceholder
	);
}

export function registerBlockEditorFilters(): void {
	registerBlockToolbarFilter();
	// Independently flag-gated: the draft entry point must register even when
	// the block toolbar button is off.
	registerDraftEntry();
	// The HOC checks the flag per render rather than at registration, so it is
	// safe to add unconditionally and cannot lose a race against the host
	// injecting `agentsManagerData`.
	registerDraftPlaceholderFilter();
}
