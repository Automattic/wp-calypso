/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/concierge/init';

/*@__INLINE__*/
export default ( state ) => get( state, 'concierge.availableTimes', null );
