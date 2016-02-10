/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import pick from 'lodash/object/pick';
import isFunction from 'lodash/lang/isFunction';
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import { SITE_RECEIVE, SERIALIZE, DESERIALIZE } from 'state/action-types';
import schema from './schema';
import { isValidStateWithSchema } from 'state/utils';

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_RECEIVE:
			//TODO: do not pass a decorated site object to SITE_RECEIVE
			//site objects are being decorated in SitesList in lib/sites/sites-list/index.js
			//with either lib/site/index.js or lib/site/jetpack.js
			const blackList = [ '_headers', 'fetchingSettings', 'fetchingUsers',
				'latestSettings', '_events', '_maxListeners' ];
			let plainJSObject = pick( action.site, ( value ) => ! isFunction( value ) );
			plainJSObject = omit( plainJSObject, blackList );
			return Object.assign( {}, state, {
				[ action.site.ID ]: plainJSObject
			} );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return isValidStateWithSchema( state, schema ) ? state : {};
	}
	return state;
}

export default combineReducers( {
	items,
	plans
} );
