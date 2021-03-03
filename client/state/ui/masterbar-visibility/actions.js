/**
 * Internal dependencies
 */
import { MASTERBAR_TOGGLE_VISIBILITY } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Hide the masterbar.
 *
 * @returns {object} Action object
 */
export const hideMasterbar = () => ( { type: MASTERBAR_TOGGLE_VISIBILITY, isVisible: false } );

/**
 * Show the masterbar.
 *
 * @returns {object} Action object
 */
export const showMasterbar = () => ( { type: MASTERBAR_TOGGLE_VISIBILITY, isVisible: true } );
