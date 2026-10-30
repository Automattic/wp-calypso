/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { redirectToNewDashboardContext, requireAccessContext } from '../controller';
import { isPathAllowed } from '../lib/permission';
import type { AgencyDashboardOptInValue } from '@automattic/api-core';
import type { Context } from '@automattic/calypso-router';

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: jest.fn(),
	isEnabled: jest.fn(),
} ) );
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );
jest.mock( 'calypso/lib/analytics/mc', () => ( { bumpStat: jest.fn() } ) );
jest.mock( 'calypso/dashboard/app/routing', () => ( {
	buildDashboardLink: ( _dashboard: string, path: string ) => `https://msd.test${ path }`,
} ) );
jest.mock( '../lib/permission', () => ( {
	isPathAllowed: jest.fn( () => true ),
	isPathAllowedForTier: () => true,
} ) );
jest.mock( '../sections/agency-tier/tier-permission-error', () => () => null );

const replace = jest.fn();

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
		jest.clearAllMocks();
		( isEnabled as jest.Mock ).mockReturnValue( true );
	} );

	it( 'sends an opted-in agency to the matching Multi-site Dashboard page', () => {
		const next = jest.fn();

		requireAccessContext( buildContext( '/agency-tier', 'opt-in' ), next );

		expect( replace ).toHaveBeenCalledWith( 'https://msd.test/tiers' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'keeps an opted-in agency on Amplify', () => {
		const next = jest.fn();

		requireAccessContext( buildContext( '/amplify', 'opt-in' ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it.each( [ 'opt-out', 'forced-opt-out', 'unset' ] as const )(
		'keeps a %s agency here',
		( value ) => {
			const next = jest.fn();

			requireAccessContext( buildContext( '/agency-tier', value ), next );

			expect( replace ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		}
	);

	it( 'keeps a legacy-billing agency here even when opted in', () => {
		const next = jest.fn();

		requireAccessContext( buildContext( '/agency-tier', 'opt-in', 'legacy' ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'keeps everyone here while the feature is off', () => {
		( isEnabled as jest.Mock ).mockReturnValue( false );
		const next = jest.fn();

		requireAccessContext( buildContext( '/agency-tier', 'opt-in' ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );

describe( 'redirectToNewDashboardContext', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( isEnabled as jest.Mock ).mockReturnValue( true );
	} );

	it( 'forwards an opted-in agency without checking the path', () => {
		const next = jest.fn();

		redirectToNewDashboardContext(
			buildContext( '/sites/all/example.com/jetpack-backup', 'opt-in' ),
			next
		);

		expect( replace ).toHaveBeenCalledWith( 'https://msd.test/sites/example.com/backups' );
		expect( isPathAllowed ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'does nothing while the feature is off', () => {
		( isEnabled as jest.Mock ).mockReturnValue( false );
		const next = jest.fn();

		redirectToNewDashboardContext(
			buildContext( '/sites/all/example.com/jetpack-backup', 'opt-in' ),
			next
		);

		expect( replace ).not.toHaveBeenCalled();
		expect( isPathAllowed ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
