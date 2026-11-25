/**
 * @vitest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { type Mock, vi } from 'vitest';
import { redirectToNewDashboardContext, requireAccessContext } from '../controller';
import { isPathAllowed } from '../lib/permission';
import type { AgencyDashboardOptInValue } from '@automattic/api-core';
import type { Context } from '@automattic/calypso-router';

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: vi.fn(),
	isEnabled: vi.fn(),
} ) );
vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: vi.fn() },
} ) );
vi.mock( 'calypso/lib/analytics/mc', () => ( { bumpStat: vi.fn() } ) );
vi.mock( 'calypso/dashboard/app/routing', () => ( {
	buildDashboardLink: ( _dashboard: string, path: string ) => `https://msd.test${ path }`,
} ) );
vi.mock( '../lib/permission', () => ( {
	isPathAllowed: vi.fn( () => true ),
	isPathAllowedForTier: () => true,
} ) );
vi.mock( '../sections/agency-tier/tier-permission-error', () => ( { default: () => null } ) );

const replace = vi.fn();

function buildContext(
	pathname: string,
	value: AgencyDashboardOptInValue,
	billingSystem: 'billingdragon' | 'legacy' = 'billingdragon'
): Context {
	const agency = { billing_system: billingSystem, dashboard_opt_in: { value, updated_at: '' } };
	return {
		pathname,
		query: {},
		store: {
			getState: () => ( { a8cForAgencies: { agencies: { activeAgency: agency } } } ),
		},
	} as unknown as Context;
}

describe( 'requireAccessContext', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...window.location, replace },
			writable: true,
		} );
	} );

	beforeEach( () => {
		vi.clearAllMocks();
		( isEnabled as Mock ).mockReturnValue( true );
	} );

	it( 'sends an opted-in agency to the matching Multi-site Dashboard page', () => {
		const next = vi.fn();

		requireAccessContext( buildContext( '/agency-tier', 'opt-in' ), next );

		expect( replace ).toHaveBeenCalledWith( 'https://msd.test/tiers' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'sends an opted-in agency to Prospect reports on the Multi-site Dashboard', () => {
		const next = vi.fn();

		requireAccessContext( buildContext( '/prospect-reports', 'opt-in' ), next );

		expect( replace ).toHaveBeenCalledWith( 'https://msd.test/prospect-reports' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it.each( [ 'opt-out', 'forced-opt-out', 'unset' ] as const )(
		'keeps a %s agency here',
		( value ) => {
			const next = vi.fn();

			requireAccessContext( buildContext( '/agency-tier', value ), next );

			expect( replace ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		}
	);

	it( 'keeps a legacy-billing agency here even when opted in', () => {
		const next = vi.fn();

		requireAccessContext( buildContext( '/agency-tier', 'opt-in', 'legacy' ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'keeps everyone here while the feature is off', () => {
		( isEnabled as Mock ).mockReturnValue( false );
		const next = vi.fn();

		requireAccessContext( buildContext( '/agency-tier', 'opt-in' ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );

describe( 'redirectToNewDashboardContext', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		( isEnabled as Mock ).mockReturnValue( true );
	} );

	it( 'forwards an opted-in agency without checking the path', () => {
		const next = vi.fn();

		redirectToNewDashboardContext(
			buildContext( '/sites/all/example.com/jetpack-backup', 'opt-in' ),
			next
		);

		expect( replace ).toHaveBeenCalledWith( 'https://msd.test/sites/example.com/backups' );
		expect( isPathAllowed ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'does nothing while the feature is off', () => {
		( isEnabled as Mock ).mockReturnValue( false );
		const next = vi.fn();

		redirectToNewDashboardContext(
			buildContext( '/sites/all/example.com/jetpack-backup', 'opt-in' ),
			next
		);

		expect( replace ).not.toHaveBeenCalled();
		expect( isPathAllowed ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
