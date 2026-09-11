import { getAvailablePendingSites, getPressableOwnershipType, isAgencyApproved } from '../lib';
import type { Agency, AgencyPendingSite } from '@automattic/api-core';

const agency = ( overrides: Partial< Agency > ) => overrides as Agency;

const pendingSite = ( id: number, state: string, licenseKey: string ): AgencyPendingSite => ( {
	id,
	features: { wpcom_atomic: { state, license_key: licenseKey } },
} );

describe( 'getPressableOwnershipType', () => {
	it( 'reports no ownership when the agency has no Pressable plan', () => {
		expect( getPressableOwnershipType( agency( {} ) ) ).toBe( 'none' );
		expect( getPressableOwnershipType( null ) ).toBe( 'none' );
		expect( getPressableOwnershipType( agency( { third_party: { pressable: null } } ) ) ).toBe(
			'none'
		);
	} );

	it( 'reports a regular plan when the A4A id is null', () => {
		expect(
			getPressableOwnershipType(
				agency( { third_party: { pressable: { pressable_id: 1, a4a_id: null } } } )
			)
		).toBe( 'regular' );
	} );

	it( 'reports an agency plan when the plan came through the marketplace', () => {
		expect(
			getPressableOwnershipType(
				agency( { third_party: { pressable: { pressable_id: 1, a4a_id: 'a4a-1' } } } )
			)
		).toBe( 'agency' );
	} );
} );

describe( 'isAgencyApproved', () => {
	it( 'approves an approved agency', () => {
		expect( isAgencyApproved( agency( { approval_status: 'approved' } ) ) ).toBe( true );
	} );

	it( 'approves legacy agencies that predate the approval status', () => {
		expect( isAgencyApproved( agency( { approval_status: '' } ) ) ).toBe( true );
	} );

	it( 'rejects pending, rejected, and missing agencies', () => {
		expect( isAgencyApproved( agency( { approval_status: 'pending' } ) ) ).toBe( false );
		expect( isAgencyApproved( agency( { approval_status: 'rejected' } ) ) ).toBe( false );
		expect( isAgencyApproved( agency( {} ) ) ).toBe( false );
		expect( isAgencyApproved( null ) ).toBe( false );
	} );
} );

describe( 'getAvailablePendingSites', () => {
	it( 'keeps only pending sites that already have a license key', () => {
		const sites = [
			pendingSite( 1, 'pending', 'key-1' ),
			pendingSite( 2, 'pending', '' ),
			pendingSite( 3, 'active', 'key-3' ),
		];

		expect( getAvailablePendingSites( sites ).map( ( { id } ) => id ) ).toEqual( [ 1 ] );
	} );

	it( 'returns an empty list while the sites are still loading', () => {
		expect( getAvailablePendingSites( undefined ) ).toEqual( [] );
	} );
} );
