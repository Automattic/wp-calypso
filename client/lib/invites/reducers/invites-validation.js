/**
 * External dependencies
 */
import { fromJS } from 'immutable';
import mapValues from 'lodash/object/mapValues';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/invites/constants';
import { decodeEntities } from 'lib/formatting';

const initialState = fromJS( {
	list: {},
	errors: {}
} );

function filterObjectProperties( object ) {
	return mapValues( object, value => {
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
		site: Object.assign( filterObjectProperties( data.blog_details ), { ID: parseInt( data.invite.blog_id, 10 ), URL: data.blog_details.domain } ),
		inviter: filterObjectProperties( data.inviter )
	}
}

const reducer = ( state = initialState, payload ) => {
	const { action } = payload;
	switch ( action.type ) {
		case ActionTypes.RECEIVE_INVITE:
			return state.setIn( [ 'list', action.siteId, action.inviteKey ], normalizeInvite( action.data ) );
		case ActionTypes.RECEIVE_INVITE_ERROR:
			return state.setIn( [ 'errors', action.siteId, action.inviteKey ], action.error );
	}
	return state;
}

export { initialState, reducer };
