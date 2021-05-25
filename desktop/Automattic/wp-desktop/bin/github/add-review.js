const { addReview } = require( './review-actions' );

try {
	addReview();
} catch ( error ) {
	console.log( 'ERROR: failed to add review: ', error ); // eslint-disable-line no-console
}
