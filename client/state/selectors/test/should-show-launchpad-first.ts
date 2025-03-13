/**
 * @jest-environment jsdom
 */
import { useLaunchpad } from '@automattic/data-stores';
import { useShouldShowLaunchpadFirst } from 'calypso/landing/stepper/hooks/use-should-show-launchpad-first';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { isMigrationInProgress } from 'calypso/sites-dashboard/utils';
import { shouldShowLaunchpadFirst } from '../should-show-launchpad-first';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	useLaunchpad: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
} ) );

jest.mock( 'calypso/sites-dashboard/utils', () => ( {
	isMigrationInProgress: jest.fn(),
} ) );

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'shouldShowLaunchpadFirst', () => {
	beforeEach( () => {
		( isMigrationInProgress as jest.Mock ).mockReturnValue( false );
	} );

	it( 'should return false when site is in migration', async () => {
		( isMigrationInProgress as jest.Mock ).mockReturnValue( true );
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: 'sell',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );
	it( 'should return true when site was created via onboarding flow, has an intent, and assigned to experiment', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: 'sell',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( true );
	} );

	it( 'should return false when site was created via onboarding flow, has the ai-assembler intent, and assigned to experiment', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: 'ai-assembler',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site was created via onboarding flow, has no intent, and assigned to experiment', async () => {
		( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
			variationName: 'treatment_cumulative',
		} );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: '',
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

describe( 'useShouldShowLaunchpadFirst', () => {
	const validSite = {
		options: {
			site_creation_flow: 'onboarding',
			site_intent: 'sell',
		},
	} as SiteDetails;

	const invalidSite = {
		options: {
			site_creation_flow: 'other',
		},
	} as SiteDetails;

	it( 'should return true when shouldShowLaunchpadFirst returns true and launchpad is loading', () => {
		( useLaunchpad as jest.Mock ).mockReturnValue( {
			data: { checklist: null },
		} );

		expect( useShouldShowLaunchpadFirst( validSite ) ).toBe( true );
	} );

	it( 'should return true when shouldShowLaunchpadFirst returns true and launchpad has items', () => {
		( useLaunchpad as jest.Mock ).mockReturnValue( {
			data: { checklist: [ 'item1', 'item2' ] },
		} );

		expect( useShouldShowLaunchpadFirst( validSite ) ).toBe( true );
	} );

	it( 'should return false when shouldShowLaunchpadFirst returns true but launchpad is empty', () => {
		( useLaunchpad as jest.Mock ).mockReturnValue( {
			data: { checklist: [] },
		} );

		expect( useShouldShowLaunchpadFirst( validSite ) ).toBe( false );
	} );

	it( 'should return false when shouldShowLaunchpadFirst returns false regardless of launchpad state', () => {
		( useLaunchpad as jest.Mock ).mockReturnValue( {
			data: { checklist: [ 'item1' ] },
		} );

		expect( useShouldShowLaunchpadFirst( invalidSite ) ).toBe( false );
	} );
} );
