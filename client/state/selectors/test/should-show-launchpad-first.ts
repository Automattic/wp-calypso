/**
 * @jest-environment jsdom
 */
import { shouldShowLaunchpadFirst } from '../should-show-launchpad-first';
import type { SiteDetails } from '@automattic/data-stores';

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'shouldShowLaunchpadFirst', () => {
	it( 'should return true when site was created via onboarding flow and has an intent', async () => {
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: 'sell',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( true );
	} );

	it( 'should return true when site was created via newsletter flow and has an intent', async () => {
		const site = {
			options: {
				site_creation_flow: 'newsletter',
				site_intent: 'newsletter',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( true );
	} );

	it( 'should return false when site was created via onboarding flow and has the ai-assembler intent', async () => {
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: 'ai-assembler',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site was created via onboarding flow and has no intent', async () => {
		const site = {
			options: {
				site_creation_flow: 'onboarding',
				site_intent: '',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site was not created via onboarding or newsletter flow, regardless of intent', async () => {
		const site = {
			options: {
				site_creation_flow: 'other',
				site_intent: 'build',
			},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site has no creation flow information', async () => {
		const site = {
			options: {},
		} as SiteDetails;

		expect( await shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );
} );
