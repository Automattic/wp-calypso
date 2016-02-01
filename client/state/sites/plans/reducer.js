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
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_REMOVE,
	SITE_PLANS_TRIAL_CANCEL,
	SITE_PLANS_TRIAL_CANCEL_COMPLETED,
	SITE_PLANS_TRIAL_CANCEL_FAILED
} from 'state/action-types';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';

export const initialSiteState = {
	data: null,
	error: null,
	hasLoadedFromServer: false,
	isFetching: false,
	isUpdating: false
};

export function plans( state = {}, action ) {
	switch ( action.type ) {
		case SITE_PLANS_FETCH:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					error: null,
					isFetching: true
				} )
			} );

		case SITE_PLANS_FETCH_COMPLETED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					error: null,
					hasLoadedFromServer: true,
					isFetching: false,
					data: action.plans
				} )
			} );

		case SITE_PLANS_FETCH_FAILED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					error: action.error,
					isFetching: false
				} )
			} );

		case SITE_PLANS_REMOVE:
			return omit( state, action.siteId );

		case SITE_PLANS_TRIAL_CANCEL:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					isUpdating: true
				} )
			} );

		case SITE_PLANS_TRIAL_CANCEL_COMPLETED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					error: null,
					hasLoadedFromServer: true,
					isUpdating: false,
					data: action.plans
				} )
			} );

		case SITE_PLANS_TRIAL_CANCEL_FAILED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, initialSiteState, state[ action.siteId ], {
					error: action.error,
					isUpdating: false
				} )
			} );

		case SERIALIZE:
			//TODO: we have full instances of moment.js on sites.plans[siteID].data
			return {};

		case DESERIALIZE:
			return {};
	}

	return state;
};
