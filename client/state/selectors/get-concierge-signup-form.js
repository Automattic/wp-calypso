/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/concierge/init';

export default ( state ) => get( state, 'concierge.signupForm', null );
