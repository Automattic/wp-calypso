import apiFetch from '@wordpress/api-fetch';
import type { Dispatch, HasSeenWhatsNewModalFetch } from './types';

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

export const updateHasSeenWhatsNewModal =
	( hasSeenWhatsNewModal: boolean ) =>
	async ( { dispatch }: Dispatch ) => {
		apiFetch( {
			method: 'PUT',
			path: '/wpcom/v2/block-editor/has-seen-whats-new-modal',
			data: { has_seen_whats_new_modal: hasSeenWhatsNewModal },
		} ).finally( () => {
			dispatch.setHasSeenWhatsNewModal( hasSeenWhatsNewModal );
		} );
	};

export const fetchHasSeenWhatsNewModal =
	() =>
	async ( { dispatch }: Dispatch ) => {
		const response: { has_seen_whats_new_modal: boolean } | undefined =
			await apiFetch< HasSeenWhatsNewModalFetch >( {
				path: '/wpcom/v2/block-editor/has-seen-whats-new-modal',
			} );
		dispatch.setHasSeenWhatsNewModal( response?.has_seen_whats_new_modal ?? true );
	};

export type HelpCenterAction = ReturnType<
	typeof setShowHelpCenter | typeof setHasSeenWhatsNewModal
>;
