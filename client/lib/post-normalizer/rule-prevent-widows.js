/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import formatting from 'lib/formatting';

export default function preventWidows( post ) {
	forEach( [ 'excerpt' ], function( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = formatting.preventWidows( post[ prop ], 2 );
		}
	} );
	return post;
}
