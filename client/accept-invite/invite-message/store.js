/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store'
import { DISPLAY_INVITE_ACCEPTED_NOTICE, DISMISS_INVITE_ACCEPTED_NOTICE, DISPLAY_INVITE_DECLINED_NOTICE, DISMISS_INVITE_DECLINED_NOTICE } from './constants'

const InviteMessageStore = createReducerStore( ( state, payload ) => {
	const { action } = payload;
	let newState = Object.assign( {}, state );
	switch ( action.type ) {
		case DISPLAY_INVITE_ACCEPTED_NOTICE:
			newState.accepted = true;
			newState.siteId = action.siteId;
			return newState;
		case DISPLAY_INVITE_DECLINED_NOTICE:
			newState.declined = true;
			newState.siteId = action.siteId;
			return newState;
		case DISMISS_INVITE_ACCEPTED_NOTICE:
		case DISMISS_INVITE_DECLINED_NOTICE:
			newState.accepted = false;
			newState.declined = false;
			newState.siteId = false;
			return newState;
	}
	return state;
}, { accepted: false, declined: false, siteId: false } );

export default InviteMessageStore;
