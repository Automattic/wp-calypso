/**
 * Internal dependencies
 */
import { REWIND_BACKUPS_SET } from 'calypso/state/action-types';

/**
 * Returns the updated backups state after an action has been dispatched. The
 * state maps site ID to the rewind backups object.
 *
 * @param   {object} state  Current state
 * @param   {object} action Action payload
 * @returns {object}        Updated state
 */
export default ( state = {}, { type, backups } ) =>
	type === REWIND_BACKUPS_SET ? backups : state;
