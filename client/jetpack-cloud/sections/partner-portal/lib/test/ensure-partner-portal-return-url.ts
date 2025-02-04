import ensurePartnerPortalReturnUrl from '../ensure-partner-portal-return-url';

describe( 'ensurePartnerPortalReturnUrl', () => {
	it.each( [
		[ '/partner-portal' ],
		[ '/partner-portal/whatever' ],
		[ '/partner-portal1230498634' ],
	] )( 'returns the original input if it begins with "/partner-portal"', ( input ) => {
		expect( ensurePartnerPortalReturnUrl( input ) ).toBe( input );
	} );

	// Type-casting to unknown and again to string[] avoids TypeScript errors;
	// the function only takes strings, but we want to test invalid input
	it.each( [ [ '' ], [ null ], [ undefined ] ] as unknown as string[] )(
		'returns "/partner-portal" if the input is null or empty',
		( input ) => {
			// Do stuff
			expect( ensurePartnerPortalReturnUrl( input ) ).toBe( '/partner-portal' );
		}
	);

	it.each( [ [ '/floop' ], [ 'partner-portal' ], [ ' /partner-portal/licenses' ] ] )(
		'returns "/partner-portal" if the input does not start with "/partner-portal"',
		( input ) => {
			expect( ensurePartnerPortalReturnUrl( input ) ).toBe( '/partner-portal' );
		}
	);
} );
