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

const IN_COHORT = 100; // % 100 === 0, in cohort
// The out-of-cohort fixtures assume the current 50% rollout (last two digits
// >= 50). At 100% no user is outside the cohort, so the cases using these no
// longer apply.
const OUT_OF_COHORT = 99; // % 100 === 99, not in cohort

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
	it( 'leaves cohort-range users unenrolled while the rollout flag is off', () => {
		expect( getHostingDashboardEnrollment( undefined, IN_COHORT ) ).toEqual( {
			enrolled: false,
		} );
	} );

	describe( 'with the rollout flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/enable-percentage-rollout' ) );

		it( 'the escape hatch (forced-opt-out) wins over cohort membership', () => {
			expect( getHostingDashboardEnrollment( preference( 'forced-opt-out' ), IN_COHORT ) ).toEqual(
				{ enrolled: false }
			);
		} );

		it( 'keeps opted-in users enrolled even when outside the cohort', () => {
			expect( getHostingDashboardEnrollment( preference( 'opt-in' ), OUT_OF_COHORT ) ).toEqual( {
				enrolled: true,
				reason: 'opt-in',
			} );
		} );

		it( 'the cohort overrides an explicit opt-out', () => {
			expect( getHostingDashboardEnrollment( preference( 'opt-out' ), IN_COHORT ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
		} );

		it( 'enrolls cohort members who have no preference', () => {
			expect( getHostingDashboardEnrollment( undefined, IN_COHORT ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
		} );

		it( 'leaves non-cohort users who never opted in unenrolled', () => {
			expect( getHostingDashboardEnrollment( preference( 'opt-out' ), OUT_OF_COHORT ) ).toEqual( {
				enrolled: false,
			} );
		} );
	} );
} );

describe( 'isOptInToggleVisible', () => {
	it( 'shows the toggle to users who are not in the cohort', () => {
		expect( isOptInToggleVisible( preference( 'opt-out' ), OUT_OF_COHORT ) ).toBe( true );
	} );

	it( 'hides the toggle from escape-hatched users even while the rollout flag is off', () => {
		expect( isOptInToggleVisible( preference( 'forced-opt-out' ), OUT_OF_COHORT ) ).toBe( false );
	} );

	describe( 'with the rollout flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/enable-percentage-rollout' ) );

		it( 'hides the toggle from cohort members', () => {
			expect( isOptInToggleVisible( preference( 'opt-in' ), IN_COHORT ) ).toBe( false );
		} );

		it( 'still shows the toggle to non-cohort users', () => {
			expect( isOptInToggleVisible( preference( 'opt-out' ), OUT_OF_COHORT ) ).toBe( true );
		} );
	} );

	describe( 'with force-opt-in-visibility on', () => {
		it( 'overrides the cohort and the escape hatch', () => {
			enableFlags( 'dashboard/force-opt-in-visibility', 'dashboard/enable-percentage-rollout' );
			expect( isOptInToggleVisible( undefined, IN_COHORT ) ).toBe( true );
			expect( isOptInToggleVisible( preference( 'forced-opt-out' ), OUT_OF_COHORT ) ).toBe( true );
		} );
	} );
} );

describe( 'isAdvancedNoticeVisible', () => {
	it( 'shows nothing while the rollout-advance-notice flag is off', () => {
		expect( isAdvancedNoticeVisible( undefined, IN_COHORT ) ).toBe( false );
		expect( isAdvancedNoticeVisible( undefined, OUT_OF_COHORT ) ).toBe( false );
	} );

	describe( 'with the rollout-advance-notice flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/rollout-advance-notice' ) );

		it( 'shows the banner to users who can still opt in', () => {
			expect( isAdvancedNoticeVisible( undefined, IN_COHORT ) ).toBe( true );
		} );

		it( 'hides the banner from non-cohort users', () => {
			expect( isAdvancedNoticeVisible( undefined, OUT_OF_COHORT ) ).toBe( false );
		} );

		it( 'hides the banner from escape-hatched (forced-opt-in) users', () => {
			expect( isAdvancedNoticeVisible( preference( 'forced-opt-in' ), IN_COHORT ) ).toBe( false );
		} );

		it( 'hides the banner from escape-hatched (forced-opt-out) users', () => {
			expect( isAdvancedNoticeVisible( preference( 'forced-opt-out' ), IN_COHORT ) ).toBe( false );
		} );
	} );
} );
