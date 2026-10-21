import config from '@automattic/calypso-config';
import {
	getHostingDashboardEnrollment,
	isOptInToggleVisible,
	isAdvancedNoticeVisible,
} from '../hosting-dashboard-enrollment';
import type { HostingDashboardOptIn } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const mock = jest.fn();
	return Object.assign( mock, { isEnabled: jest.fn() } );
} );

const mockedIsEnabled = jest.mocked( config.isEnabled );

// At 100% every user is in the cohort, whatever their ID. These two sit either
// side of the boundary the rollout used on its way up, so they double as a
// check that no ID is left behind.
const LOW_USER_ID = 100; // % 100 === 0
const HIGH_USER_ID = 99; // % 100 === 99

const preference = ( value: HostingDashboardOptIn[ 'value' ] ): HostingDashboardOptIn => ( {
	value,
	updated_at: '2026-06-01T00:00:00.000Z',
} );

const enableFlags = ( ...flags: string[] ) => {
	mockedIsEnabled.mockImplementation( ( flag: string ) => flags.includes( flag ) );
};

beforeEach( () => {
	mockedIsEnabled.mockReturnValue( false );
} );

describe( 'getHostingDashboardEnrollment', () => {
	it( 'leaves users unenrolled while the rollout flag is off', () => {
		expect( getHostingDashboardEnrollment( undefined, LOW_USER_ID ) ).toEqual( {
			enrolled: false,
		} );
		expect( getHostingDashboardEnrollment( undefined, HIGH_USER_ID ) ).toEqual( {
			enrolled: false,
		} );
	} );

	describe( 'with the rollout flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/enable-percentage-rollout' ) );

		it( 'the escape hatch (forced-opt-out) wins over cohort membership', () => {
			expect(
				getHostingDashboardEnrollment( preference( 'forced-opt-out' ), LOW_USER_ID )
			).toEqual( { enrolled: false } );
		} );

		it( 'enrolls every user, whatever their ID', () => {
			expect( getHostingDashboardEnrollment( undefined, LOW_USER_ID ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
			expect( getHostingDashboardEnrollment( undefined, HIGH_USER_ID ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
		} );

		it( 'the cohort overrides an explicit opt-out', () => {
			expect( getHostingDashboardEnrollment( preference( 'opt-out' ), LOW_USER_ID ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
		} );

		// At full rollout the cohort is checked first, so users who had opted in
		// of their own accord now report as 'forced' rather than 'opt-in'.
		it( 'reports opted-in users as forced', () => {
			expect( getHostingDashboardEnrollment( preference( 'opt-in' ), HIGH_USER_ID ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
		} );

		it( 'leaves users with no ID unenrolled', () => {
			expect( getHostingDashboardEnrollment( preference( 'opt-out' ), undefined ) ).toEqual( {
				enrolled: false,
			} );
		} );
	} );
} );

describe( 'isOptInToggleVisible', () => {
	it( 'shows the toggle while the rollout flag is off', () => {
		expect( isOptInToggleVisible( preference( 'opt-out' ), HIGH_USER_ID ) ).toBe( true );
	} );

	it( 'hides the toggle from escape-hatched users even while the rollout flag is off', () => {
		expect( isOptInToggleVisible( preference( 'forced-opt-out' ), HIGH_USER_ID ) ).toBe( false );
	} );

	describe( 'with the rollout flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/enable-percentage-rollout' ) );

		it( 'hides the toggle from every user, whatever their ID', () => {
			expect( isOptInToggleVisible( preference( 'opt-in' ), LOW_USER_ID ) ).toBe( false );
			expect( isOptInToggleVisible( preference( 'opt-out' ), HIGH_USER_ID ) ).toBe( false );
		} );
	} );

	describe( 'with force-opt-in-visibility on', () => {
		it( 'overrides the cohort and the escape hatch', () => {
			enableFlags( 'dashboard/force-opt-in-visibility', 'dashboard/enable-percentage-rollout' );
			expect( isOptInToggleVisible( undefined, LOW_USER_ID ) ).toBe( true );
			expect( isOptInToggleVisible( preference( 'forced-opt-out' ), HIGH_USER_ID ) ).toBe( true );
		} );
	} );
} );

describe( 'isAdvancedNoticeVisible', () => {
	it( 'shows nothing while the rollout-advance-notice flag is off', () => {
		expect( isAdvancedNoticeVisible( undefined, LOW_USER_ID ) ).toBe( false );
		expect( isAdvancedNoticeVisible( undefined, HIGH_USER_ID ) ).toBe( false );
	} );

	describe( 'with the rollout-advance-notice flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/rollout-advance-notice' ) );

		it( 'shows the banner to every user, regardless of cohort', () => {
			expect( isAdvancedNoticeVisible( undefined, LOW_USER_ID ) ).toBe( true );
			expect( isAdvancedNoticeVisible( undefined, HIGH_USER_ID ) ).toBe( true );
		} );

		it( 'hides the banner from escape-hatched (forced-opt-in) users', () => {
			expect( isAdvancedNoticeVisible( preference( 'forced-opt-in' ), LOW_USER_ID ) ).toBe( false );
		} );

		it( 'hides the banner from escape-hatched (forced-opt-out) users', () => {
			expect( isAdvancedNoticeVisible( preference( 'forced-opt-out' ), LOW_USER_ID ) ).toBe(
				false
			);
		} );
	} );
} );
