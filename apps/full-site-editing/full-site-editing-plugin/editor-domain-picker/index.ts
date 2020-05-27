/**
 * External dependencies
 */
import 'a8c-fse-common-data-stores';
import { select } from '@wordpress/data';

/* eslint-disable no-console */

console.log( "👋 Hi! I'm the editor-domain-picker bundle running!" );

let results;
let int: number | undefined = setInterval( () => {
	results = select( 'automattic/domains/suggestions' ).getCategories();

	if ( results.length ) {
		// eslint-disable-next-line no-console
		console.log( results );
		clearInterval( int );
		int = undefined;
	}
} );

setTimeout( () => {
	if ( int ) {
		console.log( '😢 Timed out before we were able to get Domain Categories.' );
		clearInterval( int );
	}
}, 5000 );
