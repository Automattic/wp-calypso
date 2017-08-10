/** @format */
/**
 * External Dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal Dependencies
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
