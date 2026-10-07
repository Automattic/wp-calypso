import { canStartScan, getUsageStatus, hasAllowance } from '../usage';

const resets_at = '2026-11-01T00:00:00Z';

describe( 'getUsageStatus', () => {
	it( 'is unknown without usage data', () => {
		expect( getUsageStatus( undefined ) ).toBe( 'unknown' );
	} );

	it( 'is pending while the agency awaits review', () => {
		expect(
			getUsageStatus( { used: 0, limit: 5, resets_at }, { approvalStatus: 'pending' } )
		).toBe( 'pending' );
	} );

	it( 'is pending when the API says the account is not activated', () => {
		expect( getUsageStatus( { used: 0, limit: 5, resets_at }, { notActivated: true } ) ).toBe(
			'pending'
		);
	} );

	it( 'treats a zero allowance as pending', () => {
		expect( getUsageStatus( { used: 0, limit: 0, resets_at } ) ).toBe( 'pending' );
	} );

	it( 'is rejected when the application was not approved', () => {
		expect( getUsageStatus( undefined, { approvalStatus: 'rejected' } ) ).toBe( 'rejected' );
	} );

	it( 'gives approved agencies their allowance', () => {
		expect(
			getUsageStatus( { used: 1, limit: 5, resets_at }, { approvalStatus: 'approved' } )
		).toBe( 'available' );
	} );

	it( 'flags the cap', () => {
		expect( getUsageStatus( { used: 15, limit: 15, resets_at } ) ).toBe( 'cap' );
	} );

	it( 'flags running low', () => {
		expect( getUsageStatus( { used: 4, limit: 5, resets_at } ) ).toBe( 'low' );
		expect( getUsageStatus( { used: 12, limit: 15, resets_at } ) ).toBe( 'low' );
	} );
} );

describe( 'canStartScan', () => {
	it( 'blocks at the cap, while pending, and when rejected', () => {
		expect( canStartScan( 'cap' ) ).toBe( false );
		expect( canStartScan( 'pending' ) ).toBe( false );
		expect( canStartScan( 'rejected' ) ).toBe( false );
		expect( canStartScan( 'low' ) ).toBe( true );
		expect( canStartScan( 'unknown' ) ).toBe( true );
	} );
} );

describe( 'hasAllowance', () => {
	it( 'is true only once approved with usage', () => {
		expect( hasAllowance( 'available' ) ).toBe( true );
		expect( hasAllowance( 'cap' ) ).toBe( true );
		expect( hasAllowance( 'pending' ) ).toBe( false );
		expect( hasAllowance( 'unknown' ) ).toBe( false );
	} );
} );
