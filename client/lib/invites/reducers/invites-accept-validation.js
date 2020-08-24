/**
 * External dependencies
 */

import { fromJS } from 'immutable';
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';
import { decodeEntities } from 'lib/formatting';

const initialState = fromJS( {
	list: {},
	errors: {},
} );

function filterObjectProperties( object ) {
	return mapValues( object, ( value ) => {
		if ( 'object' === typeof value ) {
			return filterObjectProperties( value );
		}

		return value ? decodeEntities( value ) : value;
	} );
}

function normalizeInvite( data ) {
	return {
		inviteKey: data.invite.invite_slug,
		date: data.invite.invite_date,
		role: decodeEntities( data.invite.meta.role ),
		sentTo: decodeEntities( data.invite.meta.sent_to ),
		forceMatchingEmail: data.invite.meta.force_matching_email,
		site: Object.assign( filterObjectProperties( data.blog_details ), {
			ID: parseInt( data.invite.blog_id, 10 ),
		} ),
		inviter: filterObjectProperties( data.inviter ),
		knownUser: data.invite.meta.known,
	};
}

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.RECEIVE_INVITE:
			return state.setIn(
				[ 'list', action.siteId, action.inviteKey ],
				normalizeInvite( action.data )
			);
		case ActionTypes.RECEIVE_INVITE_ERROR:
			return state.setIn( [ 'errors', action.siteId, action.inviteKey ], action.error );
	}
	return state;
};

export { initialState, reducer };
