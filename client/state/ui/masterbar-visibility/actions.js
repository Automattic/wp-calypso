/**
 * Internal dependencies
 */
import { MASTERBAR_TOGGLE_VISIBILITY } from 'state/action-types';

/**
 * Hide the masterbar.
 *
 * @return {object} Action object
 */
export const hideMasterbar = () => ( { type: MASTERBAR_TOGGLE_VISIBILITY, isVisible: false } );

/**
 * Show the masterbar.
 *
 * @return {object} Action object
 */
export const showMasterbar = () => ( { type: MASTERBAR_TOGGLE_VISIBILITY, isVisible: true } );
