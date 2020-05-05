/**
 * External dependencies
 */
import { get } from 'lodash';

export default ( state ) => get( state, 'concierge.hasAvailableConciergeSessions', null );
