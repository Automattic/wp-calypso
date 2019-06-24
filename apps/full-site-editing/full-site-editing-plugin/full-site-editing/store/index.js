/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import * as selectors from './selectors';

registerStore( 'a8c/full-site-editing', {
	reducer: state => state,
	selectors,
} );
