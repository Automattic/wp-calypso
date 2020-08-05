function test() {
	__( 'Simple string' );

	_n( 'Singular', 'Plural' );

	_x( 'String with context', 'simple context' );

	_nx( 'String with context', 'Plural with context', null, 'simple context' );

	// translators: String comment
	__( 'String with comment' );

	// translators: String comment
	_n( 'String with comment', 'Plural with comment' );
}

export default test;
