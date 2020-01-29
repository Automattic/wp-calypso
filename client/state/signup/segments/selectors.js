/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSegments = state => get( state, [ 'signup', 'segments' ], null );
