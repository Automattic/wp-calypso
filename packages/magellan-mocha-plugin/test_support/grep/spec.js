describe( '', function () {
	const noop = function () {};
	it( 'A', noop );
	it( 'B @match', noop );
	it( 'C', noop );
	describe( 'D @match', function () {
		it( 'E', noop );
		it( 'F', noop );
	} );
} );
