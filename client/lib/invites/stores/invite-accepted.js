/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store'
import { action as ActionTypes } from 'lib/invites/constants';

const InviteMessageStore = createReducerStore( ( state, payload ) => {
	const { action } = payload;
	let newState = Object.assign( {}, state );
	switch ( action.type ) {
		case ActionTypes.DISPLAY_INVITE_ACCEPTED_NOTICE:
			newState.accepted = true;
			newState.siteId = action.siteId;
			return newState;
		case ActionTypes.DISPLAY_INVITE_DECLINED_NOTICE:
			newState.declined = true;
			newState.siteId = action.siteId;
			return newState;
		case ActionTypes.DISMISS_INVITE_ACCEPTED_NOTICE:
		case ActionTypes.DISMISS_INVITE_DECLINED_NOTICE:
			newState.accepted = false;
			newState.declined = false;
			newState.siteId = false;
			return newState;
	}
	return state;
}, { accepted: false, declined: false, siteId: false } );

export default InviteMessageStore;
