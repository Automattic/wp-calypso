/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import {
	shouldShowLaunchpadFirst,
	useShouldShowLaunchpadFirst,
} from '../should-show-launchpad-first';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
} ) );

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'shouldShowLaunchpadFirst', () => {
	it( 'should return true when site was created via onboarding flow and assigned to experiment', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( true );
	} );

	it( 'should return false when site was created via onboarding flow but assigned to control', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'control',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site was not created via onboarding flow', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'other',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site has no creation flow information', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );
} );

describe( 'useShouldShowLaunchpadFirst', () => {
	it( 'returns loading state until promise resolves', async () => {
		const { promise, resolve } = promiseWithResolvers();
		( loadExperimentAssignment as jest.Mock ).mockReturnValue( promise );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		const { result } = renderHook( () => useShouldShowLaunchpadFirst( site ) );

		expect( result.current[ 0 ] ).toBe( true );

		await act( () => resolve( { variationName: 'treatment_cumulative' } ) );

		expect( result.current ).toEqual( [ false, true ] );
	} );

	it( 'should return true when site was created via onboarding flow and assigned to experiment', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		const { result } = renderHook( () => useShouldShowLaunchpadFirst( site ) );

		await waitFor( () => expect( result.current ).toEqual( [ false, true ] ) );
	} );

	it( 'should return false when site was created via onboarding flow but assigned to control', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'control',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		const { result } = renderHook( () => useShouldShowLaunchpadFirst( site ) );

		await waitFor( () => expect( result.current ).toEqual( [ false, false ] ) );
	} );

	it( 'should return false when site was not created via onboarding flow', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'other',
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		const { result } = renderHook( () => useShouldShowLaunchpadFirst( site ) );

		await waitFor( () => expect( result.current ).toEqual( [ false, false ] ) );
	} );

	it( 'should return false when site has no creation flow information', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				created_at: '2025-02-18T00:00:00+00:00',
			},
		} as SiteDetails;

		const { result } = renderHook( () => useShouldShowLaunchpadFirst( site ) );

		await waitFor( () => expect( result.current ).toEqual( [ false, false ] ) );
	} );
} );

// Our TS Config doesn't know the standard Promise.withResolvers is available
// in our version of Node.
function promiseWithResolvers() {
	let resolve;
	let reject;
	const promise = new Promise( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { promise, resolve, reject };
}
