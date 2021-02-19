/**
 * Internal dependencies
 */
import { REWIND_CAPABILITIES_UPDATE } from 'calypso/state/action-types';

export default ( state = {}, { type, data } ) =>
	type === REWIND_CAPABILITIES_UPDATE ? data : state;
