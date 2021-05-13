/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

export const getSegments = ( state ) => get( state, [ 'signup', 'segments' ], null );
