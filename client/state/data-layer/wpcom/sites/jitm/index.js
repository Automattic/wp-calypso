/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { SECTION_SET, SELECTED_SITE_SET, JITM_SET } from 'state/action-types';
import config from 'config';

const process = {
	hasInitializedSites: false,
	hasInitializedSection: false,
	lastSection: null,
	lastSite: null,
};

export const handleProcessJITM = ( state, dispatch, action ) => {
	if ( ! config.isEnabled( 'jitms' ) ) {
		return;
	}

	if ( ! process.hasInitializedSites || ! process.hasInitializedSection ) {
		dispatch( {
			type: JITM_SET,
			jitms: [],
		} );
		return;
	}

	const currentSite = process.lastSite;

	if ( ! isJetpackSite( state, currentSite ) ) {
		dispatch( {
			type: JITM_SET,
			jitms: [],
		} );
		return;
	}

	dispatch( http( {
		apiNamespace: 'wpcom',
		method: 'GET',
		path: `/v2/sites/${ currentSite }/jitm/calypso:${ process.lastSection }:admin_notices`,
		query: {
			external_user_id: getCurrentUserId( state ),
		}
	}, action ) );
};

export const handleRouteChange = ( { getState, dispatch }, action ) => {
	if ( ! config.isEnabled( 'jitms' ) ) {
		return;
	}

	switch ( action.isLoading ) {
		case false:
			process.hasInitializedSection = true;
			return;
		case true:
			process.hasInitializedSection = false;
			return;
	}

	process.lastSection = action.section.name;

	handleProcessJITM( getState(), dispatch, action );
};

export const handleSiteSelection = ( { getState, dispatch }, action ) => {
	process.hasInitializedSites = ! ! action.siteId;
	process.lastSite = action.siteId;

	handleProcessJITM( getState(), dispatch, action );
};

export const receiveJITM = ( { dispatch }, { siteId, site_id }, data ) => {
	dispatch( {
		type: JITM_SET,
		jitms: data,
	} );
};

export const failedJITM = ( { dispatch } ) => {
	dispatch( {
		type: JITM_SET,
		jitms: [],
	} );
};

export default {
	[ SECTION_SET ]: [
		dispatchRequest(
			handleRouteChange,
			receiveJITM,
			failedJITM
		)
	],
	[ SELECTED_SITE_SET ]: [
		dispatchRequest(
			handleSiteSelection,
			receiveJITM,
			failedJITM
		)
	],
};
