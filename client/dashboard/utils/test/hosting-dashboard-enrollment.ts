import config from '@automattic/calypso-config';
import {
	getHostingDashboardEnrollment,
	isOptInToggleVisible,
} from '../hosting-dashboard-enrollment';
import type { HostingDashboardOptIn } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const mock = jest.fn();
	return Object.assign( mock, { isEnabled: jest.fn() } );
} );

const mockedConfig = jest.mocked( config );
const mockedIsEnabled = jest.mocked( config.isEnabled );

const CUTOFF_USER_ID = 275231967;
const PRE_CUTOFF_IN_COHORT = 100; // % 100 === 0, below the cutoff
// The out-of-cohort fixtures assume the current 50% rollout (last two digits
// >= 50). At 100% no user is outside the cohort, so the cases using these no
// longer apply.
const PRE_CUTOFF_OUT_OF_COHORT = 99; // % 100 === 99, below the cutoff
const POST_CUTOFF_OUT_OF_COHORT = ( Math.floor( CUTOFF_USER_ID / 100 ) + 1 ) * 100 + 99; // % 100 === 99, above the cutoff

const preference = ( value: HostingDashboardOptIn[ 'value' ] ): HostingDashboardOptIn => ( {
	value,
	updated_at: '2026-06-01T00:00:00.000Z',
} );

const enableFlags = ( ...flags: string[] ) => {
	mockedIsEnabled.mockImplementation( ( flag: string ) => flags.includes( flag ) );
};

beforeEach( () => {
	mockedConfig.mockImplementation( ( key: string ) =>
		key === 'dashboard_opt_in_oldest_eligible_user' ? CUTOFF_USER_ID : undefined
	);
	mockedIsEnabled.mockReturnValue( false );
} );

describe( 'getHostingDashboardEnrollment', () => {
	it( 'leaves cohort-range users unenrolled while the rollout flag is off', () => {
		expect( getHostingDashboardEnrollment( undefined, PRE_CUTOFF_IN_COHORT ) ).toEqual( {
			enrolled: false,
		} );
	} );

	describe( 'with the rollout flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/enable-percentage-rollout' ) );

		it( 'the escape hatch (forced-opt-out) wins over cohort membership', () => {
			expect(
				getHostingDashboardEnrollment( preference( 'forced-opt-out' ), PRE_CUTOFF_IN_COHORT )
			).toEqual( { enrolled: false } );
		} );

		it( 'keeps opted-in users enrolled even when outside the cohort', () => {
			expect(
				getHostingDashboardEnrollment( preference( 'opt-in' ), PRE_CUTOFF_OUT_OF_COHORT )
			).toEqual( { enrolled: true, reason: 'opt-in' } );
		} );

		it( 'the cohort overrides an explicit opt-out', () => {
			expect(
				getHostingDashboardEnrollment( preference( 'opt-out' ), PRE_CUTOFF_IN_COHORT )
			).toEqual( { enrolled: true, reason: 'forced' } );
		} );

		it( 'enrolls cohort members who have no preference', () => {
			expect( getHostingDashboardEnrollment( undefined, PRE_CUTOFF_IN_COHORT ) ).toEqual( {
				enrolled: true,
				reason: 'forced',
			} );
		} );

		it( 'leaves non-cohort users who never opted in unenrolled', () => {
			expect(
				getHostingDashboardEnrollment( preference( 'opt-out' ), PRE_CUTOFF_OUT_OF_COHORT )
			).toEqual( { enrolled: false } );
		} );
	} );
} );

describe( 'isOptInToggleVisible', () => {
	it( 'shows the toggle to pre-cutoff users', () => {
		expect( isOptInToggleVisible( preference( 'opt-out' ), PRE_CUTOFF_OUT_OF_COHORT ) ).toBe(
			true
		);
	} );

	it( 'hides the toggle from post-cutoff users', () => {
		expect( isOptInToggleVisible( undefined, POST_CUTOFF_OUT_OF_COHORT ) ).toBe( false );
	} );

	it( 'hides the toggle from escape-hatched users even while the rollout flag is off', () => {
		expect( isOptInToggleVisible( preference( 'forced-opt-out' ), PRE_CUTOFF_OUT_OF_COHORT ) ).toBe(
			false
		);
	} );

	describe( 'with the rollout flag on', () => {
		beforeEach( () => enableFlags( 'dashboard/enable-percentage-rollout' ) );

		it( 'hides the toggle from cohort members', () => {
			expect( isOptInToggleVisible( preference( 'opt-in' ), PRE_CUTOFF_IN_COHORT ) ).toBe( false );
		} );

		it( 'still shows the toggle to non-cohort users', () => {
			expect( isOptInToggleVisible( preference( 'opt-out' ), PRE_CUTOFF_OUT_OF_COHORT ) ).toBe(
				true
			);
		} );
	} );

	describe( 'with force-opt-in-visibility on', () => {
		it( 'shows the toggle to post-cutoff users who would otherwise not see it', () => {
			enableFlags( 'dashboard/force-opt-in-visibility' );
			expect( isOptInToggleVisible( undefined, POST_CUTOFF_OUT_OF_COHORT ) ).toBe( true );
		} );

		it( 'overrides the cohort and the escape hatch', () => {
			enableFlags( 'dashboard/force-opt-in-visibility', 'dashboard/enable-percentage-rollout' );
			expect( isOptInToggleVisible( undefined, PRE_CUTOFF_IN_COHORT ) ).toBe( true );
			expect(
				isOptInToggleVisible( preference( 'forced-opt-out' ), PRE_CUTOFF_OUT_OF_COHORT )
			).toBe( true );
		} );
	} );
} );
