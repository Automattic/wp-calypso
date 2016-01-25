/**
 * Internal dependencies
 */
import {
	FETCH_SITE_PLANS,
	FETCH_SITE_PLANS_COMPLETED,
	REMOVE_SITE_PLANS
} from './action-types';
import { TO_OBJECT } from 'state/action-types';
import omit from 'lodash/object/omit';

export const initialSiteState = {
	error: null,
	hasLoadedFromServer: false,
	isFetching: false,
	data: null
};

export function plans( state = {}, action ) {
	switch ( action.type ) {
		case FETCH_SITE_PLANS:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					isFetching: true
				} )
			} );
		case FETCH_SITE_PLANS_COMPLETED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					error: null,
					hasLoadedFromServer: true,
					isFetching: false,
					data: action.plans
				} )
			} );
		case REMOVE_SITE_PLANS:
			return omit( state, action.siteId );
		case TO_OBJECT:
			//TODO: we have full instances of moment.js on sites.plans[siteID].data
			return initialSiteState;
	}

	return state;
};
