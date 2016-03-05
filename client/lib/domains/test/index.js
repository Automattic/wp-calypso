describe( 'domains', () => {

	describe( 'dns', () => {
		require( '../dns/test/index-test' );
		require( '../dns/test/reducer-test' );
	} );

	describe( 'dns', () => {
		require( '../email-forwarding/test/reducer-test' );
		require( '../email-forwarding/test/store-test' );
	} );

	describe( 'nameservers', () => {
		require( '../nameservers/test/store-test' );
	} );

	describe( 'whois', () => {
		require( '../whois/test/assembler-test' );
		require( '../whois/test/store-test' );
	} );
} );
