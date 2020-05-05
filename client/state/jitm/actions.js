/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { JITM_DISMISS, JITM_FETCH, JITM_SET } from 'state/action-types';
import 'state/data-layer/wpcom/sites/jitm';

/**
 * Dismisses a jitm
 *
 * @param {number} siteId The site id to dismiss the jitm for
 * @param {string} id The id of the jitm to dismiss
 * @param {string} featureClass The feature class of the jitm to dismiss
 * @returns {object} The dismiss action
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
 * @param {object} jitms The objects to display
 * @returns {object} The jitm insert action
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
 * @returns {object} The action to clear out all the jitms
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
 * @returns {object} The action to fetch the jitms
 */
export const fetchJITM = ( siteId, messagePath, locale ) => ( {
	type: JITM_FETCH,
	siteId,
	messagePath,
	locale,
} );
