var WPCOM = require( '../../' );

// anonymous auth since `freshlyPressed()` doesn't require auth
var wpcom = WPCOM();

wpcom.freshlyPressed( function ( err, data ) {
	if ( err ) throw err;
	console.log( 'Freshly Pressed Posts:' );
	data.posts.forEach( function ( post ) {
		console.log( '  %s - %s', post.title, post.short_URL );
	} );
} );
