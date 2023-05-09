import { forEach } from 'lodash';
import { preventWidows as preventWidowFormatting } from 'calypso/lib/formatting';

export default function preventWidows( post ) {
	forEach( [ 'excerpt' ], function ( prop ) {
		if ( post[ prop ] ) {
			post[ prop ] = preventWidowFormatting( post[ prop ], 2 );
		}
	} );
	return post;
}
