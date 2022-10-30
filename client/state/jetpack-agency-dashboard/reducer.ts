import { withStorageKey } from '@automattic/state-utils';
import { Reducer, AnyAction } from 'redux';
import { combineReducers } from 'calypso/state/utils';
import { AppState } from 'calypso/types';
import {
	JETPACK_AGENCY_DASHBOARD_PURCHASED_LICENSE_CHANGE,
	JETPACK_AGENCY_DASHBOARD_SELECT_LICENSE,
	JETPACK_AGENCY_DASHBOARD_UNSELECT_LICENSE,
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
				licenses: [ ...state.licenses, action.license ],
			};
		case JETPACK_AGENCY_DASHBOARD_UNSELECT_LICENSE:
			return {
				...state,
				siteId: action.siteId,
				licenses: state.licenses.filter( ( license ) => license !== action.license ),
			};
	}
	return state;
};
const combinedReducer = combineReducers( {
	purchasedLicense,
	selectedLicenses,
} );

export default withStorageKey( 'agencyDashboard', combinedReducer );
