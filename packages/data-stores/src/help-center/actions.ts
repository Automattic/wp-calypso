import { apiFetch } from '@wordpress/data-controls';

export const setShowHelpCenter = ( show: boolean ) => {
	return {
		type: 'HELP_CENTER_SET_SHOW',
		show,
	};
};

export const setHasSeenWhatsNewModal = ( hasSeenWhatsNewModal: boolean ) => {
	return {
		type: 'HELP_CENTER_SET_HAS_SEEN_WHATS_NEW_MODAL',
		hasSeenWhatsNewModal,
	};
};

export function* fetchHasSeenWhatsNewModal() {
	const response: { has_seen_whats_new_modal: boolean } = yield apiFetch( {
		path: '/wpcom/v2/block-editor/has-seen-whats-new-modal',
	} );

	return {
		type: 'HELP_CENTER_FETCH_STATUS_SUCCESS',
		response,
	};
}

export type HelpCenterAction = ReturnType<
	typeof setShowHelpCenter | typeof setHasSeenWhatsNewModal | typeof fetchHasSeenWhatsNewModal
>;
