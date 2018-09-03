/** @format */

/**
 * External Dependencies
 */
import { noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema.json';
import { clearJITM, insertJITM } from 'state/jitm/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { http } from 'state/data-layer/wpcom-http/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { SECTION_SET, SELECTED_SITE_SET, JITM_DISMISS } from 'state/action-types';

import { registerHandlers } from 'state/data-layer/handler-registry';

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

/**
 * Existing libraries do not escape decimal encoded entities that php encodes, this handles that.
 * @param {string} str The string to decode
 * @return {string} The decoded string
 */
const unescapeDecimalEntities = str => {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
};

/**
 * Given an object from the api, prepare it to be consumed by the ui by transforming the shape of the data
 * @param {object} jitms The jitms to display from the api
 * @return {object} The transformed data to display
 */
const transformApiRequest = ( { data: jitms } ) =>
	jitms.map( jitm => ( {
		message: unescapeDecimalEntities( jitm.content.message ),
		description: unescapeDecimalEntities( jitm.content.description ),
		featureClass: jitm.feature_class,
		callToAction: unescapeDecimalEntities( jitm.CTA.message ),
		id: jitm.id,
	} ) );

/**
 * Processes the current state and determines if it should fire a jitm request
 * @param {object} state The current state
 * @param {function} dispatch The redux dispatch function
 * @param {string} action The action being processed
 * @return {undefined} Nothing
 */
export const fetchJITM = ( state, dispatch, action ) => {
	if ( ! process.hasInitializedSites || ! process.hasInitializedSection ) {
		return;
	}

	const currentSite = process.lastSite;

	if ( ! isJetpackSite( state, currentSite ) ) {
		return;
	}

	dispatch(
		http(
			{
				apiNamespace: 'rest',
				method: 'GET',
				path: `/v1.1/jetpack-blogs/${ currentSite }/rest-api/`,
				query: {
					path: '/jetpack/v4/jitm',
					query: JSON.stringify( {
						message_path: `calypso:${ process.lastSection }:admin_notices`,
					} ),
					http_envelope: 1,
				},
			},
			{ ...action, messagePath: process.lastSection }
		)
	);
};

/**
 * Dismisses a jitm on the jetpack site, it returns nothing useful and will return no useful error, so we'll
 * fail and succeed silently.
 * @param {function} dispatch The dispatch function
 * @param {object} action The dismissal action
 * @return {undefined}
 */
export const doDismissJITM = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiNamespace: 'rest',
				method: 'POST',
				path: `/jetpack-blogs/${ action.siteId }/rest-api/`,
				query: {
					path: '/jetpack/v4/jitm',
					body: JSON.stringify( {
						feature_class: action.featureClass,
						id: action.id,
					} ),
					http_envelope: 1,
					json: false,
				},
			},
			action
		)
	);

/**
 * Called when a route change might have occured
 * @param {function} getState A function to retrieve the current state
 * @param {string} action The action being processed
 * @param {function} dispatch A function to dispatch an action
 */
export const handleRouteChange = ( { getState, dispatch }, action ) => {
	const sectionName = get( action, [ 'section', 'name' ] );
	if ( process.hasInitializedSection && action.section && process.lastSection === sectionName ) {
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

	process.lastSection = sectionName;

	fetchJITM( getState(), dispatch, action );
};

/**
 * Called when a site is selected
 * @param {function} getState Function to get the current state
 * @param {string} action The action being processed
 * @param {function} dispatch The dispatch function
 */
export const handleSiteSelection = ( { getState, dispatch }, action ) => {
	if ( process.hasInitializedSites && process.lastSite === action.siteId ) {
		return;
	}

	process.hasInitializedSites = !! action.siteId;
	process.lastSite = action.siteId;

	fetchJITM( getState(), dispatch, action );
};

/**
 * Called when the http layer receives a valid jitm
 * @param {function} dispatch The dispatch function
 * @param {number} siteId The site id
 * @param {object} jitms The jitms
 * @param {number} site_id The site id
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @return {undefined} Nothing
 */
export const receiveJITM = ( { dispatch, getState }, { siteId, site_id, messagePath }, jitms ) => {
	if ( site_id === undefined && site_id === undefined ) {
		siteId = getSelectedSiteId( getState() );
	}
	dispatch( insertJITM( siteId || site_id, messagePath, jitms ) );
};

/**
 * Called when a jitm fails for any network related reason
 * @param {function} dispatch The dispatch function
 * @param {number} siteId The site id
 * @param {number} site_id The site id
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @return {undefined} Nothing
 */
export const failedJITM = ( { dispatch }, { siteId, site_id, messagePath } ) =>
	dispatch( clearJITM( siteId || site_id, messagePath ) );

registerHandlers( 'state/data-layer/wpcom/sites/jitm/index.js', {
	[ SECTION_SET ]: [
		dispatchRequest( handleRouteChange, receiveJITM, failedJITM, {
			fromApi: makeJsonSchemaParser( schema, transformApiRequest ),
		} ),
	],

	[ SELECTED_SITE_SET ]: [
		dispatchRequest( handleSiteSelection, receiveJITM, failedJITM, {
			fromApi: makeJsonSchemaParser( schema, transformApiRequest ),
		} ),
	],

	[ JITM_DISMISS ]: [ dispatchRequest( doDismissJITM, noop, noop, {} ) ],
} );

export default {};
