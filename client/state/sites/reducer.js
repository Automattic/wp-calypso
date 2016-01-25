/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import pick from 'lodash/object/pick';
import indexBy from 'lodash/collection/indexBy';
import isFunction from 'lodash/lang/isFunction';
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import { SITE_RECEIVE, TO_OBJECT, FROM_OBJECT } from 'state/action-types';

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
			state = Object.assign( {}, state, {
				[ action.site.ID ]: action.site
			} );
			break;
		case TO_OBJECT:
			// scrub _events, _maxListeners, and other misc functions
			const sites = Object.keys( state ).map( ( siteID ) => {
				let plainJSObject = Object.assign( {}, state[ siteID ] );
				plainJSObject = pick( plainJSObject, ( value ) => ! isFunction( value ) );
				plainJSObject = omit( plainJSObject, [ '_events', '_maxListeners'] );
				return plainJSObject;
			} );
			return indexBy( sites, 'ID' );
		case FROM_OBJECT:
			//TODO: do we need to redecorate?
			return state;
	}

	return state;
}

export default combineReducers( {
	items,
	plans
} );
