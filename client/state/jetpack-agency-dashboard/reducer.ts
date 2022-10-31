import { withStorageKey } from '@automattic/state-utils';
import { Reducer, AnyAction } from 'redux';
import { combineReducers } from 'calypso/state/utils';
import { AppState } from 'calypso/types';
import {
	JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE,
	JETPACK_AGENCY_DASHBOARD_SELECT_LICENSE,
	JETPACK_AGENCY_DASHBOARD_UNSELECT_LICENSE,
	JETPACK_AGENCY_DASHBOARD_RESET_SITE,
} from './action-types';
import type { PurchasedProduct } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const purchasedLicense: Reducer< { purchasedLicense: PurchasedProduct | null }, AnyAction > = (
	state = { purchasedLicense: null },
	action: AnyAction
): AppState => {
	switch ( action?.type ) {
		case JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE:
			return { ...state, purchasedLicense: action.payload };
	}
	return state;
};

const selectedLicenses: Reducer<
	{ siteId: null | number; licenses: Array< string > },
	AnyAction
> = ( state = { siteId: null, licenses: [] }, action: AnyAction ): AppState => {
	switch ( action?.type ) {
		case JETPACK_AGENCY_DASHBOARD_SELECT_LICENSE:
			return {
				...state,
				siteId: action.siteId,
				licenses:
					action.siteId !== state.siteId
						? // If the site is different, reset existing licenses.
						  [ action.license ]
						: // Otherwise, append the license to the list.
						  [ ...state.licenses, action.license ],
			};
		case JETPACK_AGENCY_DASHBOARD_UNSELECT_LICENSE: {
			const filtered = state.licenses.filter( ( license ) => license !== action.license );

			return {
				...state,
				// Reset the selected site in case there are no selected licenses.
				siteId: filtered.length === 0 ? null : action.siteId,
				licenses: filtered,
			};
		}
		case JETPACK_AGENCY_DASHBOARD_RESET_SITE:
			return {
				...state,
				siteId: null,
				licenses: [],
			};
	}
	return state;
};
const combinedReducer = combineReducers( {
	purchasedLicense,
	selectedLicenses,
} );

export default withStorageKey( 'agencyDashboard', combinedReducer );
