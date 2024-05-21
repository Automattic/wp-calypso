/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { addQueryArgs } from '../../../../lib/url';
import { goToCheckout } from '../../utils/checkout';
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getAssertionConditionResult, getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );
jest.mock( 'calypso/lib/guides/trigger-guides-for-step', () => ( {
	triggerGuidesForStep: jest.fn(),
} ) );

describe( 'Site Migration Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		( useIsSiteOwner as jest.Mock ).mockReturnValue( {
			isOwner: true,
		} );

		const apiBaseUrl = 'https://public-api.wordpress.com';
		const testSettingsEndpoint = '/rest/v1.4/sites/example.wordpress.com/settings';
		nock( apiBaseUrl ).get( testSettingsEndpoint ).reply( 200, {} );
		nock( apiBaseUrl ).post( testSettingsEndpoint ).reply( 200, {} );
		nock( apiBaseUrl ).post( '/wpcom/v2/guides/trigger' ).reply( 200, {} );
	} );

	afterEach( () => {
		// Restore the original implementation after each test
		jest.restoreAllMocks();
	} );

	describe( 'useAssertConditions', () => {
		it( 'redirects the user to the login page when they are not logged in', () => {
			( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );

			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );
			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				`/start/account/user-social?variationName=site-migration&toStepper=true&redirect_to=/setup/site-migration`
			);
		} );

		it( 'redirects the user to the start page when there is not siteSlug and SiteID', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }?siteSlug=&siteId=`,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
		} );

		it( 'redirects the user to the start page when the user is not the site owner', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );
			( useIsSiteOwner as jest.Mock ).mockReturnValue( { isOwner: false } );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
		} );

		it( 'renders the step with success', () => {
			const { runUseAssertionCondition } = renderFlow( siteMigrationFlow );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( getAssertionConditionResult() ).toEqual( { state: 'success' } );
		} );
	} );

	describe( 'navigation', () => {
		beforeEach( () => {
			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/guides/trigger', {
					flow: 'site-migration',
					step: 'site-migration-identify',
				} )
				.reply( 200, { success: true } );

			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/guides/trigger', {
					flow: 'site-migration',
					step: 'site-migration-import-or-migrate',
				} )
				.reply( 200, { success: true } );

			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/guides/trigger', {
					flow: 'site-migration',
					step: 'site-migration-upgrade-plan',
				} )
				.reply( 200, { success: true } );

			nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/guides/trigger', {
					flow: 'site-migration',
					step: 'site-migration-assign-trial-plan',
				} )
				.reply( 200, { success: true } );
		} );

		it( 'redirects the user to the migrate or import page when the platform is wordpress', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'continue',
					platform: 'wordpress',
					from: 'https://site-to-be-migrated.com',
				},
			} );

			await waitFor( () => {
				expect( getFlowLocation() ).toEqual( {
					path: `/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?from=https%3A%2F%2Fsite-to-be-migrated.com&siteSlug=example.wordpress.com`,
					state: null,
				} );
			} );
		} );

		it( 'redirects the user to the import content flow when was not possible to indentify the platform', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );
			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'continue',
					platform: 'unknown',
					from: 'https://example-to-be-migrated.com',
				},
			} );

			await waitFor( () => {
				expect( window.location.assign ).toHaveBeenCalledWith(
					addQueryArgs(
						{
							siteSlug: 'example.wordpress.com',
							from: 'https://example-to-be-migrated.com',
							origin: 'site-migration-identify',
							backToFlow: '/site-migration/site-migration-identify',
						},
						'/setup/site-setup/importList'
					)
				);
			} );
		} );

		it( 'redirects the user to the import content flow when the user skip the plaform identification', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );
			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'skip_platform_identification',
				},
			} );

			await waitFor( () => {
				expect( window.location.assign ).toHaveBeenCalledWith(
					addQueryArgs(
						{
							siteSlug: 'example.wordpress.com',
							origin: 'site-migration-identify',
							backToFlow: '/site-migration/site-migration-identify',
						},
						'/setup/site-setup/importList'
					)
				);
			} );
		} );

		it( 'migrate redirects from the import-from page to new instructions if flag enabled', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug }`,
				state: {
					siteSlug: 'example.wordpress.com',
				},
			} );
		} );

		it( 'redirects the user to the checkout page with the correct destination params', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com`,
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					goToCheckout: true,
					plan: PLAN_MIGRATION_TRIAL_MONTHLY,
					sendIntentWhenCreatingTrial: true,
				},
				cancelDestination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com`,
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
				extraQueryParams: { hosting_intent: HOSTING_INTENT_MIGRATE },
				flowName: 'site-migration',
				siteSlug: 'example.wordpress.com',
				stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				cancelDestination: `/setup/site-migration/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
				plan: PLAN_MIGRATION_TRIAL_MONTHLY,
			} );
		} );

		it( 'upgrade redirects from the import-from page to site-migration-upgrade-plan page', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
				dependencies: {
					destination: 'upgrade',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-upgrade-plan',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects from site-migration-assign-trial-plan step to bundleTransfer step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_INSTRUCTIONS_I2.slug }`,
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'calls triggerGuidesForStep when navigating site migration identify', async () => {
			const flowName = 'site-migration';
			const currentStep = STEPS.SITE_MIGRATION_IDENTIFY.slug;

			triggerGuidesForStep( flowName, currentStep );

			expect( triggerGuidesForStep ).toHaveBeenCalledWith( flowName, currentStep );
		} );

		it( 'calls triggerGuidesForStep when navigating to the import or migrate step', async () => {
			const flowName = 'site-migration';
			const currentStep = STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug;

			triggerGuidesForStep( flowName, currentStep );

			expect( triggerGuidesForStep ).toHaveBeenCalledWith( flowName, currentStep );
		} );

		it( 'calls triggerGuidesForStep when navigating site migration upgrade plan', async () => {
			const flowName = 'site-migration';
			const currentStep = STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug;

			triggerGuidesForStep( flowName, currentStep );

			expect( triggerGuidesForStep ).toHaveBeenCalledWith( flowName, currentStep );
		} );

		it( 'calls triggerGuidesForStep when navigating site migration assign trial plan', async () => {
			const flowName = 'site-migration';
			const currentStep = STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug;

			triggerGuidesForStep( flowName, currentStep );

			expect( triggerGuidesForStep ).toHaveBeenCalledWith( flowName, currentStep );
		} );
	} );

	describe( 'goBack', () => {
		it( 'stays on the same step with showModal:true', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&showModal=true`,
				state: null,
			} );
		} );

		it( 'redirects the user to the goal step when going back from the identify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/goals?siteSlug=example.wordpress.com'
			);
		} );
	} );
} );
