/** @format */
/**
 * Internal Dependencies
 */
import { JITM_DISMISS, JITM_SET } from 'state/action-types';

import 'state/data-layer/wpcom/sites/jitm';

/**
 * Dismisses a jitm
 * @param {int} siteId The site id to dismiss the jitm for
 * @param {string} id The id of the jitm to dismiss
 * @param {string} featureClass The feature class of the jitm to dismiss
 * @return {object} The dismiss action
 */
export const dismissJetpackJITM = ( siteId, id, featureClass ) => ( {
	type: JITM_DISMISS,
	siteId,
	id,
	featureClass,
} );

/**
 * Inserts a jitm into the store for display
 * @param {int} siteId The site identifier
 * @param {string} messagePath The path of the jitm (ex: "calypso:comments:admin_notices")
 * @param {object} jitms The objects to display
 * @return {object} The jitm insert action
 */
export const insertJITM = ( siteId, messagePath, jitms ) => ( {
	type: JITM_SET,
	keyedPath: messagePath + siteId,
	jitms: jitms.map( jitm => ( { ...jitm, lastUpdated: Date.now() } ) ),
} );

/**
 * Removes all jitms for a given message path
 * @param {int} siteId The site identifier
 * @param {string} messagePath The path of the jitm (ex: "calypso:comments:admin_notices")
 * @return {object} The action to clear out all the jitms
 */
export const clearJITM = ( siteId, messagePath ) => ( {
	type: JITM_SET,
	keyedPath: messagePath + siteId,
	jitms: [],
} );
