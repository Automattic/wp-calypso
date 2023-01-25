import { HelpCenter } from '@automattic/data-stores';
import { dispatch as dataStoreDispatch } from '@wordpress/data';
import { get } from 'lodash';
import {
	JITM_DISMISS,
	JITM_FETCH,
	JITM_SET,
	JITM_OPEN_HELP_CENTER,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/jitm';
import 'calypso/state/jitm/init';

/**
 * Dismisses a jitm
 *
 * @param {number} siteId The site id to dismiss the jitm for
 * @param {string} id The id of the jitm to dismiss
 * @param {string} featureClass The feature class of the jitm to dismiss
 * @returns {Object} The dismiss action
 */
export const dismissJITM = ( siteId, id, featureClass ) => ( {
	type: JITM_DISMISS,
	siteId,
	id,
	featureClass,
} );

/**
 * Inserts a jitm into the store for display
 *
 * @param {number} siteId The site identifier
 * @param {string} messagePath The path of the jitm (ex: "calypso:comments:admin_notices")
 * @param {Object} jitms The objects to display
 * @returns {Object} The jitm insert action
 */
export const insertJITM = ( siteId, messagePath, jitms ) => ( {
	type: JITM_SET,
	keyedPath: messagePath + siteId,
	jitms: jitms.map( ( jitm ) => ( { ...jitm, lastUpdated: Date.now() } ) ),
} );

/**
 * Removes all jitms for a given message path
 *
 * @param {number} siteId The site identifier
 * @param {string} messagePath The path of the jitm (ex: "calypso:comments:admin_notices")
 * @returns {Object} The action to clear out all the jitms
 */
export const clearJITM = ( siteId, messagePath ) => ( {
	type: JITM_SET,
	keyedPath: messagePath + siteId,
	jitms: [],
} );

/**
 * Setup JITM devtools
 *
 * @param {number} siteId The site identifier
 * @param {Function} dispatch dispather function
 */
export const setupDevTool = ( siteId, dispatch ) => {
	if ( typeof window === 'undefined' || siteId === get( window, '_jitm.siteId' ) ) {
		return;
	}

	window._jitm = {
		siteId,
		insert: ( messagePath, jitms ) => dispatch( insertJITM( siteId, messagePath, jitms ) ),
		clear: ( messagePath ) => dispatch( clearJITM( siteId, messagePath ) ),
	};
};

/**
 * Fetch the list of JITMs
 *
 * @param {number} siteId The site id
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @param {?string} locale Current user locale
 * @returns {Object} The action to fetch the jitms
 */
export const fetchJITM = ( siteId, messagePath, locale ) => ( {
	type: JITM_FETCH,
	siteId,
	messagePath,
	locale,
} );

/**
 * Returns an action thunk that opens the help center from a JITM CTA
 *
 * @param {Object} payload The payload coming from the JITM CTA
 * @param {Location[]} payload.history The history to pass in, allowing users to go back to the previous page
 * @param {number} payload.index The index of where we are in the history
 * @returns {Function} The action thunk
 */
export const openHelpCenterFromJITM =
	( { history = {}, index = 0 } ) =>
	( dispatch ) => {
		const HELP_CENTER_STORE = HelpCenter.register();
		dataStoreDispatch( HELP_CENTER_STORE ).setRouterState( history, index );
		dataStoreDispatch( HELP_CENTER_STORE ).setShowHelpCenter( true );
		dataStoreDispatch( HELP_CENTER_STORE ).setChatTag( 'churn_chat_prompt' );
		dispatch( {
			type: JITM_OPEN_HELP_CENTER,
		} );
	};
