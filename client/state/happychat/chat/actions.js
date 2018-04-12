/** @format */

/**
 * Internal dependencies
 */
import { HAPPYCHAT_ACTIVITY } from 'state/action-types';

/**
 * Returns an action object for updating last chat activity,
 * as it was received from Happychat.
 *
 * @return { Object } Action object
 */
export const updateActivity = () => ( { type: HAPPYCHAT_ACTIVITY } );
