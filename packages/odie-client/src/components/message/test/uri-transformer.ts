import { uriTransformer } from '../uri-transformer';

describe( 'uriTransformer', () => {
	it( 'should add ref search param to internal URLs', () => {
		const internalUrl = 'https://wordpress.com/support/make-a-screenshot/';

		const transformedUrl = uriTransformer( internalUrl );

		expect( transformedUrl ).toContain( 'ref=odie' );
	} );

	it( 'should not add ref search param to external URLs', () => {
		const externalUrl = 'https://example.com/';

		const transformedUrl = uriTransformer( externalUrl );

		expect( transformedUrl ).not.toContain( 'ref=odie' );
	} );
} );
