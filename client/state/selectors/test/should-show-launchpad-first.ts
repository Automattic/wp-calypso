/**
 * @jest-environment jsdom
 */
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { shouldShowLaunchpadFirst } from '../should-show-launchpad-first';
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
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( true );
	} );

	it( 'should return false when site was not created via onboarding flow', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'other',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site has no creation flow information', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );
} );
