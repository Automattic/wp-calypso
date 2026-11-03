function test() {
	translate( 'Simple string' );

	translate( 'Singular', 'Plural' );

	translate( 'String with context', {
		context: 'simple context',
	} );

	translate( 'String with context', 'Plural with context', {
		context: 'simple context',
	} );

	translate( 'String with comment', {
		comment: 'String comment',
	} );

	translate( 'String with comment', 'Plural with comment', {
		comment: 'String comment',
	} );
}

export default test;
