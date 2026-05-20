import { validateParams } from '../validate-params';

function makeQuery( pairs: Record< string, string > ): URLSearchParams {
	return new URLSearchParams( pairs );
}

describe( 'validateParams', () => {
	it( 'accepts a canonical business-bundle URL', () => {
		const result = validateParams(
			makeQuery( {
				plan: 'business-bundle',
				redirect_to: 'https://allowed.example/x',
				integration: 'telex',
				context_id: 'proj-abc-123',
				title: 'My project',
				coupon: 'SAVE20',
			} )
		);
		expect( result.plan ).toBe( 'business-bundle' );
		expect( result.redirectTo ).toBe( 'https://allowed.example/x' );
		expect( result.integration ).toBe( 'telex' );
		expect( result.contextId ).toBe( 'proj-abc-123' );
		expect( result.title ).toBe( 'My project' );
		expect( result.coupon ).toBe( 'SAVE20' );
		expect( result.invalidPlan ).toBe( false );
	} );

	it.each( [
		'business-bundle',
		'business-bundle-monthly',
		'business-bundle-2y',
		'business-bundle-3y',
		'ecommerce-bundle',
		'ecommerce-bundle-monthly',
		'ecommerce-bundle-2y',
		'ecommerce-bundle-3y',
	] )( 'accepts atomic-triggering plan slug: %s', ( slug ) => {
		const result = validateParams( makeQuery( { plan: slug } ) );
		expect( result.invalidPlan ).toBe( false );
		expect( result.plan ).toBe( slug );
	} );

	it.each( [ 'personal-bundle', 'value_bundle', '', 'business' ] )(
		'flags non-atomic plan as invalid: %s',
		( slug ) => {
			const result = validateParams( makeQuery( { plan: slug } ) );
			expect( result.invalidPlan ).toBe( true );
		}
	);

	it( 'flags missing plan as invalid', () => {
		const result = validateParams( new URLSearchParams() );
		expect( result.invalidPlan ).toBe( true );
		expect( result.plan ).toBeNull();
	} );

	it( 'drops integration when it fails the regex', () => {
		const result = validateParams(
			makeQuery( { plan: 'business-bundle', integration: '../../etc' } )
		);
		expect( result.integration ).toBeNull();
		expect( result.invalidParams ).toContain( 'integration' );
	} );

	it( 'drops integration when too long', () => {
		const longValue = 'a'.repeat( 33 );
		const result = validateParams(
			makeQuery( { plan: 'business-bundle', integration: longValue } )
		);
		expect( result.integration ).toBeNull();
	} );

	it( 'drops context_id when it fails the regex', () => {
		const result = validateParams(
			makeQuery( { plan: 'business-bundle', context_id: "' OR 1=1" } )
		);
		expect( result.contextId ).toBeNull();
		expect( result.invalidParams ).toContain( 'context_id' );
	} );

	it( 'truncates title to 80 chars', () => {
		const title = 'A'.repeat( 100 );
		const result = validateParams( makeQuery( { plan: 'business-bundle', title } ) );
		expect( result.title ).toHaveLength( 80 );
	} );

	it( 'returns empty title for missing or whitespace-only', () => {
		expect( validateParams( makeQuery( { plan: 'business-bundle' } ) ).title ).toBeNull();
		expect(
			validateParams( makeQuery( { plan: 'business-bundle', title: '   ' } ) ).title
		).toBeNull();
	} );

	it( 'passes through coupon unchanged (existing checkout handles validation)', () => {
		const result = validateParams(
			makeQuery( { plan: 'business-bundle', coupon: 'whatever-string' } )
		);
		expect( result.coupon ).toBe( 'whatever-string' );
	} );

	it( 'passes through ref unchanged', () => {
		const result = validateParams( makeQuery( { plan: 'business-bundle', ref: 'partner-page' } ) );
		expect( result.ref ).toBe( 'partner-page' );
	} );
} );
