import { getProcessedGravatarUrl } from '../utils';

describe( 'getProcessedGravatarUrl', () => {
	test( 'returns null when avatarUrl is undefined', () => {
		expect( getProcessedGravatarUrl( undefined ) ).toBeNull();
	} );

	test( 'returns null when avatarUrl is not a valid URL', () => {
		expect( getProcessedGravatarUrl( 'not-a-url' ) ).toBeNull();
	} );

	test( 'adds d, r, and s query parameters to a valid URL', () => {
		const result = getProcessedGravatarUrl( 'https://gravatar.com/avatar/abc123' );

		const url = new URL( result! );
		expect( url.origin ).toBe( 'https://gravatar.com' );
		expect( url.searchParams.get( 'd' ) ).toBe( 'mm' );
		expect( url.searchParams.get( 'r' ) ).toBe( 'G' );
		expect( url.searchParams.get( 's' ) ).toBe( '208' );
	} );
} );
