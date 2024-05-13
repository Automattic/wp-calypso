/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useStartUrl } from '../use-start-url';

jest.mock( 'calypso/boot/locale', () => ( {
	getLocaleFromQueryParam: jest.fn().mockReturnValue( 'fr' ),
	getLocaleFromPathname: jest.fn().mockReturnValue( 'fr' ),
} ) );

jest.mock( '../../utils/path', () => ( {
	useLoginUrl: jest.fn().mockReturnValue( '/start/account?variationName=test-flow' ),
} ) );

describe( 'useStartUrl', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				search: '?aff=123&vid=456',
				replace: jest.fn(), // Ensure this is mocked if used in your code
				href: '',
			},
			writable: true, // Allow this definition to be writable if needed later
		} );
	} );

	it( 'should generate the correct start URL', () => {
		// Use the hook and assert results
		const { result } = renderHook( () => useStartUrl( 'test-flow' ) );

		expect( result.current ).toBe(
			'/start/account?variationName=test-flow&redirect_to=/setup/test-flow%3Flocale%3Dfr&vid=456&aff=123'
		);
	} );

	afterAll( () => {
		// Restore the original window.location object after all tests are done
		jest.restoreAllMocks();
	} );
} );
