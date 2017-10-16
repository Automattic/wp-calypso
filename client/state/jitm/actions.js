/**
 * Internal Dependencies
 */
import { JITM_DISMISS, JITM_SET } from 'state/action-types.js';

export const dismissJetpackJITM = ( dispatch, siteId, id, featureClass ) => {
	dispatch(
		{
			type: JITM_DISMISS,
			siteId,
			id,
			featureClass,
		}
	);
};

/**
 * Inserts a jitm into the store for display
 * @param {function} dispatch The dispatch function
 * @param {int} siteId The site identifier
 * @param {string} messagePath The path of the jitm (ex: "calypso:comments:admin_notices")
 * @param {object} jitms The objects to display
 * @return {undefined}
 */
export const insertJITM = ( dispatch, siteId, messagePath, jitms ) =>
	dispatch( {
		type: JITM_SET,
		keyedPath: messagePath + siteId,
		jitms: jitms.map( jitm => ( { ...jitm, lastUpdated: Date.now() } ) ),
	} );

/**
 * Removes all jitms for a given message path
 * @param {function} dispatch The dispatch function
 * @param {int} siteId The site identifier
 * @param {string} messagePath The path of the jitm (ex: "calypso:comments:admin_notices")
 * @return {undefined}
 */
export const clearJITM = ( dispatch, siteId, messagePath ) =>
	dispatch( {
		type: JITM_SET,
		keyedPath: messagePath + siteId,
		jitms: [],
	} );
