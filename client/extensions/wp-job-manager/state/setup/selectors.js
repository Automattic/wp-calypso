/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function getSetupState( state ) {
	return get( state, 'extensions.wpJobManager.setup', {} );
}

/**
 * Returns true if we are creating pages for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether pages are being created
 */
export function isCreatingPages( state, siteId ) {
	return get( getSetupState( state ), [ siteId, 'creating' ], false );
}

/**
 * Returns true if we are fetching setup status for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether setup status is being fetched
 */
export function isFetchingSetupStatus( state, siteId ) {
	return get( getSetupState( state ), [ siteId, 'fetching' ], false );
}

/**
 * Returns true if we should advance to the next step of the wizard, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether to advance to the next step of the wizard
 */
export function shouldGoToNextStep( state, siteId ) {
	return get( getSetupState( state ), [ siteId, 'nextStep' ], false );
}

/**
 * Returns true if we should show the setup wizard, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether to show the setup wizard
 */
export function shouldShowSetupWizard( state, siteId ) {
	return get( getSetupState( state ), [ siteId, 'status' ], false );
}
