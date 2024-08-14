/**
 * @jest-environment jsdom
 */
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { HOW_TO_MIGRATE_OPTIONS } from '../../constants';
import { goToCheckout } from '../../utils/checkout';
import hostedSiteMigrationFlow from '../hosted-site-migration-flow';
import { STEPS } from '../internals/steps';
import { getAssertionConditionResult, getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );
jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const actualIsEnabled = actual.isEnabled;

	actual.isEnabled = jest.fn().mockImplementation( ( feature ) => {
		if ( 'migration-flow/revamp' === feature ) {
			return false;
		}
		return actualIsEnabled( feature );
	} );

	return actual;
} );

describe( 'Hosted site Migration Flow', () => {
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
		it( 'renders the step succesfully', () => {
			const { runUseAssertionCondition } = renderFlow( hostedSiteMigrationFlow );

			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( getAssertionConditionResult() ).toEqual( { state: 'success' } );
		} );
	} );

	describe( 'navigation', () => {
		it( 'redirects the user to the create site page when the platform is wordpress and no site is set', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: '/setup/hosted-site-migration',
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'continue',
					platform: 'wordpress',
					from: 'https://site-to-be-migrated.com',
				},
			} );

			await waitFor( () => {
				expect( getFlowLocation() ).toEqual( {
					path: `/${ STEPS.SITE_CREATION_STEP.slug }?from=https%3A%2F%2Fsite-to-be-migrated.com`,
					state: null,
				} );
			} );
		} );

		it( 'redirects to the site creation step when import action is selected', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: '/setup/hosted-site-migration',
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					action: 'skip_platform_identification',
				},
			} );

			await waitFor( () => {
				expect( getFlowLocation() ).toEqual( {
					path: `/${ STEPS.SITE_CREATION_STEP.slug }`,
					state: null,
				} );
			} );
		} );
		it( 'redirects to processing after site creation', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_CREATION_STEP.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }`,
				state: null,
			} );
		} );

		it( 'redirects to setup/importList after site creation if no from query parameter is set', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/processing?siteSlug=example.wordpress.com`,
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					siteCreated: true,
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/importList?siteSlug=example.wordpress.com&origin=site-migration-identify&backToFlow=%2Fhosted-site-migration%2Fsite-migration-identify'
			);
		} );
		it( 'redirects to import/migrate screen after site creation if a from query parameter is set', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/processing?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com`,
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					siteCreated: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
				state: null,
			} );
		} );
		it( 'migrate redirects from the import-from page to how-to-migrate page', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }`,
				state: {
					siteSlug: 'example.wordpress.com',
				},
			} );
		} );

		it( 'migrate redirects from the how-to-migrate (myself) page page to instructions page', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug,
				dependencies: {
					destination: 'migrate',
					how: 'myself',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_INSTRUCTIONS.slug }`,
				state: {
					siteSlug: 'example.wordpress.com',
				},
			} );
		} );

		it( 'migrate redirects from the how-to-migrate (do it for me) page to assisted migration page', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug,
				dependencies: {
					destination: 'migrate',
					how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_ASSISTED_MIGRATION.slug }`,
				state: {
					siteSlug: 'example.wordpress.com',
				},
			} );
		} );

		it( 'migrate redirects from the how-to-migrate (upgrade needed) page to site-migration-upgrade-plan step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug,
				dependencies: {
					destination: 'upgrade',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&destination=upgrade`,
				state: null,
			} );
		} );

		it( 'redirects the user to the checkout page with the correct destination params', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com`,
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					goToCheckout: true,
					plan: PLAN_MIGRATION_TRIAL_MONTHLY,
					sendIntentWhenCreatingTrial: true,
				},
				cancelDestination: `/setup/hosted-site-migration/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com`,
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination: `/setup/hosted-site-migration/${ STEPS.SITE_MIGRATION_INSTRUCTIONS.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
				extraQueryParams: { hosting_intent: HOSTING_INTENT_MIGRATE },
				flowName: 'hosted-site-migration',
				siteSlug: 'example.wordpress.com',
				stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				cancelDestination: `/setup/hosted-site-migration/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com`,
				plan: PLAN_MIGRATION_TRIAL_MONTHLY,
			} );
		} );

		it( 'upgrade redirects from the import-from page to site-migration-how-to-migrate', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
				dependencies: {
					destination: 'upgrade',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-how-to-migrate',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects from site-migration-assign-trial-plan step to bundleTransfer step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-instructions',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );
	} );

	describe( 'goBack', () => {
		it( 'backs to the identify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );

		it( 'redirects the user to the goal step when going back from the identify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( hostedSiteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/goals?siteSlug=example.wordpress.com'
			);
		} );
	} );
} );
