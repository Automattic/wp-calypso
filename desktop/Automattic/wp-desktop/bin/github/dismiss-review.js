const { getReviews } = require( './review-actions' );

try {
	// dismiss existing reviews for user 'wp-desktop'
	getReviews( true );
} catch ( error ) {
	console.log( 'ERROR: failed to dismiss review(s): ', error ); // eslint-disable-line no-console
}
