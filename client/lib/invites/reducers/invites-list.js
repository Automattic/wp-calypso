/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';

const initialState = fromJS( {
	fetchingInvites: {},
	list: {},
	errors: {}
} );

function inviteArrayToObject( invites ) {
	const reduceToInviteObject = ( o, invite ) => Object.assign( o, { [ invite.invite_key ]: invite } );

	return invites.reduce( reduceToInviteObject, {} );
}

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.FETCH_INVITES:
			return state.setIn( [ 'fetchingInvites', action.siteId ], true );
		case ActionTypes.RECEIVE_INVITES:
			return state
				.setIn( [ 'fetchingInvites', action.siteId ], false )
				.mergeDeepIn( [ 'list', action.siteId ], fromJS( inviteArrayToObject( action.data.invites ) ) );
		case ActionTypes.RECEIVE_INVITES_ERROR:
			return state.setIn( [ 'errors', action.siteId ], action.error );
	}
	return state;
}

export { initialState, reducer };
