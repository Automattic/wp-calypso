/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { SECTION_SET, SELECTED_SITE_SET, JITM_SET } from 'state/action-types';

const process = {
	hasInitializedSites: false,
	hasInitializedSection: false,
	lastSection: null,
	lastSite: null,
};

export const handleProcessJITM = ( state, dispatch, action ) => {
	if ( ! process.hasInitializedSites || ! process.hasInitializedSection ) {
		return;
	}

	const currentSite = process.lastSite;

	if ( ! isJetpackSite( state, currentSite ) ) {
		return;
	}

	console.log( 'getting jitm: ', process );

	dispatch( http( {
		apiNamespace: 'wpcom',
		method: 'GET',
		path: `/v2/sites/${ currentSite }/jitm/calypso:${ process.lastSection }:admin_notices`,
		query: {
			external_user_id: getCurrentUserId( state ),
			user_roles: 'administrator',
			query_string: '', // will always be empty
			XDEBUG_SESSION_START: 'XDEBUG_OMATTIC',
		}
	}, action ) );

	console.log( 'sent', {
		message_path: `calypso:${ process.lastSection }:admin_notices`,
		site_id: currentSite,
		user_id: getCurrentUserId( state )
	} );
};

export const handleRouteChange = ( { getState, dispatch }, action ) => {
	switch ( action.isLoading ) {
		case false:
			process.hasInitializedSection = true;
			return;
		case true:
			process.hasInitializedSection = false;
			return;
	}

	process.lastSection = action.section.name;

	console.log( 'changed route: ', action );

	handleProcessJITM( getState(), dispatch, action );
};

export const handleSiteSelection = ( { getState, dispatch }, action ) => {
	console.log( 'selected site: ', action );

	process.hasInitializedSites = !! action.siteId;
	process.lastSite = action.siteId;

	handleProcessJITM( getState(), dispatch, action );
};

export const receiveJITM = ( { dispatch }, { siteId }, data ) => {
	console.log( `received data for ${ siteId }`, data );
	dispatch( {
		type: JITM_SET,
		jitms: data,
	} );
};

export const failedJITM = () => {
	console.log( 'failed jitm' );
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
