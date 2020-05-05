/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal Dependencies
 */
import { preventWidows as preventWidowFormatting } from 'lib/formatting';

export default function preventWidows( post ) {
	forEach( [ 'excerpt' ], function ( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = preventWidowFormatting( post[ prop ], 2 );
		}
	} );
	return post;
}
