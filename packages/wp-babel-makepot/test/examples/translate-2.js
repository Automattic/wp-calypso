/**
 * External dependencies
 */
import { translate as _x } from 'i18n-calypso';

function test() {
	translate( 'Simple string', {
		comment: 'Second occurrence of `Simple string` should also be extracted.',
	} );

	translate( 'Stack comments', { comment: 'First comment' } );
	translate( 'Stack comments', { comment: 'Second comment' } );

	// translators: Extract from leading comment first
	translate( 'Extract from leading comment' );

	/* translators: Extract from leading comment second */
	translate( 'Extract from leading comment' );

	_x(
		'Exrract _x as alias for translate',
		'Second param should be extracted as plural instead of context'
	);
}

export default test;
