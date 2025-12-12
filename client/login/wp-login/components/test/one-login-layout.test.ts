import { ensureHeadingProvided } from '../one-login-layout';

describe( 'ensureHeadingProvided', () => {
	const originalEnv = process.env.NODE_ENV;

	afterEach( () => {
		process.env.NODE_ENV = originalEnv;
	} );

	test( 'returns the heading when provided', () => {
		expect( ensureHeadingProvided( 'Hello' ) ).toBe( 'Hello' );
	} );

	test( 'throws in non-production environments when heading is missing', () => {
		expect( () => ensureHeadingProvided( undefined ) ).toThrow(
			/OneLoginLayout rendered without heading text/i
		);
	} );

	test( 'does not throw in production even when heading is missing', () => {
		process.env.NODE_ENV = 'production';
		expect( ensureHeadingProvided( undefined ) ).toBeNull();
	} );
} );
