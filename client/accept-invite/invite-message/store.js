/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store'
import { DISPLAY_INVITE_ACCEPTED, DISPLAY_INVITE_ACCEPTED_DISMISS, DISPLAY_INVITE_DECLINED, DISPLAY_INVITE_DECLINED_DISMISS } from './constants'

const InviteMessageStore = createReducerStore( ( state, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case DISPLAY_INVITE_ACCEPTED:
			state.showAccepted = true;
			state.siteId = action.siteId
			break;
		case DISPLAY_INVITE_DECLINED:
			state.showDeclined = true;
			break;
		case DISPLAY_INVITE_ACCEPTED_DISMISS:
		case DISPLAY_INVITE_DECLINED_DISMISS:
			state.showAccepted = false;
			state.showDeclined = false;
			break;
	}
	return state;
}, { showAccepted: false, showDeclined: false, siteId: false } );

InviteMessageStore.isVisible = function() {
	const state = this.get();
	return ( state.showAccepted || state.showDeclined );
};

export default InviteMessageStore;
