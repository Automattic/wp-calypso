/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { JITM_SET, SECTION_SET, SELECTED_SITE_SET } from 'state/action-types';
import config from 'config';
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import schema from './schema.json';

/**
 * Poor man's process manager
 * @type {{
 * hasInitializedSites: boolean,
 * hasInitializedSection: boolean,
 * lastSection: null|string,
 * lastSite: null|string,
 * }}
 */
const process = {
	hasInitializedSites: false,
	hasInitializedSection: false,
	lastSection: null,
	lastSite: null,
};

const unescapeDecimalEntities = ( str ) => {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
};

const transformApiRequest = ( jitms ) => jitms.map( ( jitm ) =>
	( {
		message: unescapeDecimalEntities( jitm.content.message ),
		description: unescapeDecimalEntities( jitm.content.description ),
		featureClass: jitm.feature_class,
		callToAction: unescapeDecimalEntities( jitm.CTA.message ),
		id: jitm.id,
	} )
);

/**
 * Processes the current state and determines if it should fire a jitm request
 * @param {object} state The current state
 * @param {function} dispatch The redux dispatch function
 * @param {string} action The action being processed
 */
export const fetchJITM = ( state, dispatch, action ) => {
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

/**
 * Called when a route change might have occured
 * @param {function} getState A function to retrieve the current state
 * @param {string} action The action being processed
 * @param {function} dispatch A function to dispatch an action
 */
export const handleRouteChange = ( { getState, dispatch }, action ) => {
	if ( ! config.isEnabled( 'jitms' ) ) {
		return;
	}

	// wait for loading to complete before trying to show a jitm since we cannot capture enough state until
	// loading completes
	switch ( action.isLoading ) {
		case false:
			process.hasInitializedSection = true;
			return;
		case true:
			process.hasInitializedSection = false;
			return;
	}

	process.lastSection = action.section.name;

	fetchJITM( getState(), dispatch, action );
};

/**
 * Called when a site is selected
 * @param {function} getState Function to get the current state
 * @param {string} action The action being processed
 * @param {function} dispatch The dispatch function
 */
export const handleSiteSelection = ( { getState, dispatch }, action ) => {
	if ( ! config.isEnabled( 'jitms' ) ) {
		return;
	}

	process.hasInitializedSites = ! ! action.siteId;
	process.lastSite = action.siteId;

	fetchJITM( getState(), dispatch, action );
};

/**
 * Called when the http layer receives a valid jitm
 * @param {function} dispatch The dispatch function
 * @param {number} siteId The site id
 * @param {object} jitms The jitms
 * @param {number} site_id The site id
 */
export const receiveJITM = ( { dispatch }, { siteId, site_id }, jitms ) => {
	dispatch( {
		type: JITM_SET,
		siteId: site_id || siteId,
		jitms: jitms
	} );
};

/**
 * Called when a jitm fails for any network related reason
 * @param {function} dispatch The dispatch function
 * @param {number} siteId The site id
 * @param {number} site_id The site id
 */
export const failedJITM = ( { dispatch }, { siteId, site_id } ) => {
	debugger;
	dispatch( {
		type: JITM_SET,
		siteId: site_id || siteId,
		jitms: [],
	} );
};

export default {
	[ SECTION_SET ]: [
		dispatchRequest(
			handleRouteChange,
			receiveJITM,
			failedJITM,
			{ fromApi: makeParser( schema, {}, transformApiRequest ) }
		)
	],
	[ SELECTED_SITE_SET ]: [
		dispatchRequest(
			handleSiteSelection,
			receiveJITM,
			failedJITM,
			{ fromApi: makeParser( schema, {}, transformApiRequest ) }
		)
	],
};
