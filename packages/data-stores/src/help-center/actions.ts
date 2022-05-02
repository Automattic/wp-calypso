import { apiFetch } from '@wordpress/data-controls';

export const setShowHelpCenter = ( show: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	} as const );

export const setHasSeenWhatsNewModal = ( hasSeenWhatsNewModal: boolean ) =>
	( {
		type: 'HELP_CENTER_SET_HAS_SEEN_WHATS_NEW_MODAL',
		hasSeenWhatsNewModal,
	} as const );

export function* fetchHasSeenWhatsNewModal() {
	const response: { has_seen_whats_new_modal: boolean } | undefined = yield apiFetch( {
		path: '/wpcom/v2/block-editor/has-seen-whats-new-modal',
	} );

	return setHasSeenWhatsNewModal( response?.has_seen_whats_new_modal ?? true );
}

export type HelpCenterAction = ReturnType<
	typeof setShowHelpCenter | typeof setHasSeenWhatsNewModal
>;
