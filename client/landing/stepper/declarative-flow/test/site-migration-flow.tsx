/**
 * @jest-environment jsdom
 */
import { goToCheckout } from '../../utils/checkout';
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
describe( 'Site Migration Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	describe( 'navigation', () => {
		it( 'redirects the user to the migrate or import page when the platform is wordpress', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );
			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					platform: 'wordpress',
					from: 'https://site-to-be-migrated.com',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-import-or-migrate?from=https%3A%2F%2Fsite-to-be-migrated.com&siteSlug=example.wordpress.com',
				state: null,
			} );
		} );

		it( 'redirects the user to the import content flow when was not possible to indentify the platform', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );
			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
				dependencies: {
					platform: 'unknown',
					from: 'https://example-to-be-migrated.com',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/importList?siteSlug=example.wordpress.com&from=https%3A%2F%2Fexample-to-be-migrated.com&origin=site-migration-identify'
			);
		} );

		it( 'migrate redirects from the import-from page to bundleTransfer step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.BUNDLE_TRANSFER.slug,
				dependencies: {
					destination: 'migrate',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/processing',
				state: {
					bundleProcessing: true,
				},
			} );
		} );

		it( 'redirects the user to the checkout page with the correct destination params', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentURL:
					'/setup/site-migration-upgrade-plan?siteSlug=example.wordpress.com&from=https://site-to-be-migrated.com',
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					goToCheckout: true,
				},
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination:
					'/setup/site-migration/bundleTransfer?siteSlug=example.wordpress.com&from=https%3A%2F%2Fsite-to-be-migrated.com',
				flowName: 'site-migration',
				siteSlug: 'example.wordpress.com',
				stepName: 'site-migration-upgrade-plan',
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

		it( 'redirects from upgrade-plan to bundleTransfer step after selecting a free trial', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					freeTrialSelected: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/bundleTransfer',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects from upgrade-plan to verifyEmail if user is unverified', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					verifyEmail: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.VERIFY_EMAIL.slug }`,
				state: null,
			} );
		} );

		it( 'redirects from verifyEmail back to upgrade-plan', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.VERIFY_EMAIL.slug,
				dependencies: {
					verifyEmail: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }`,
				state: null,
			} );
		} );
	} );

	describe( 'goBack', () => {
		it( 'backs to the indentify step', async () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteMigrationFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?siteSlug=example.wordpress.com`,
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
