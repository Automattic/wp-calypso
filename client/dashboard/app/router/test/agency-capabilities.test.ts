/**
 * @jest-environment jsdom
 */

import { hasAnyCapability, isAllowedByCapabilities } from '../agency';

describe( 'hasAnyCapability', () => {
	test( 'returns true when the single required capability is present', () => {
		expect( hasAnyCapability( [ 'a4a_read_reports' ], 'a4a_read_reports' ) ).toBe( true );
	} );

	test( 'returns false when the single required capability is absent', () => {
		expect( hasAnyCapability( [ 'a4a_read_users' ], 'a4a_read_reports' ) ).toBe( false );
	} );

	test( 'returns true when at least one of an array is present (any-of)', () => {
		expect(
			hasAnyCapability( [ 'a4a_read_users' ], [ 'a4a_read_reports', 'a4a_read_users' ] )
		).toBe( true );
	} );

	test( 'returns false when none of an array is present', () => {
		expect(
			hasAnyCapability( [ 'a4a_read_marketplace' ], [ 'a4a_read_reports', 'a4a_read_users' ] )
		).toBe( false );
	} );

	test( 'returns false for an empty capabilities list', () => {
		expect( hasAnyCapability( [], 'a4a_read_reports' ) ).toBe( false );
	} );
} );

describe( 'isAllowedByCapabilities', () => {
	test( 'allows a route with no capability requirement', () => {
		expect( isAllowedByCapabilities( [ { staticData: {} }, {} ], [] ) ).toBe( true );
	} );

	test( 'allows when the required capability is present', () => {
		expect(
			isAllowedByCapabilities(
				[ { staticData: { requiresAgencyCapability: 'a4a_read_reports' } } ],
				[ 'a4a_read_reports' ]
			)
		).toBe( true );
	} );

	test( 'blocks when a matched route requires an absent capability', () => {
		expect(
			isAllowedByCapabilities(
				[ { staticData: { requiresAgencyCapability: 'a4a_read_reports' } } ],
				[ 'a4a_read_users' ]
			)
		).toBe( false );
	} );

	test( 'blocks when any matched route in the chain is unauthorized', () => {
		expect(
			isAllowedByCapabilities(
				[
					{ staticData: {} },
					{
						staticData: {
							requiresAgencyCapability: [ 'a4a_read_reports', 'a4a_edit_reports' ],
						},
					},
				],
				[ 'a4a_read_users' ]
			)
		).toBe( false );
	} );
} );
