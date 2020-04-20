/**
 * Internal dependencies
 */
import { REWIND_STATE_UPDATE } from 'state/action-types';

export default ( state = null, { type, data } ) => ( type === REWIND_STATE_UPDATE ? data : state) ;
