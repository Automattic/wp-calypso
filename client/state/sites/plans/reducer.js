/**
 * External dependencies
 */
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PLANS_REMOVE
} from 'state/action-types';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';

export const initialSiteState = {
	error: null,
	hasLoadedFromServer: false,
	isFetching: false,
	data: null
};

export function plans( state = {}, action ) {
	switch ( action.type ) {
		case SITE_PLANS_FETCH:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					isFetching: true
				} )
			} );

		case SITE_PLANS_FETCH_COMPLETED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					error: null,
					hasLoadedFromServer: true,
					isFetching: false,
					data: action.plans
				} )
			} );

		case SITE_PLANS_REMOVE:
			return omit( state, action.siteId );

		case SERIALIZE:
			//TODO: we have full instances of moment.js on sites.plans[siteID].data
			return {};

		case DESERIALIZE:
			return {};
	}

	return state;
};
