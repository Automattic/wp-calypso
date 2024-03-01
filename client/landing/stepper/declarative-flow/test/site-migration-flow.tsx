/**
 * @jest-environment jsdom
 */
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

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
		it( 'redirects the user to the migrate or import page when the platform is wordpress', async () => {
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
				'/setup/site-setup/importList?siteSlug=example.wordpress.com&from=https%3A%2F%2Fexample-to-be-migrated.com'
			);
		} );

		it( 'migrate redirects from the import-from page to bundleTransfer step', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.BUNDLE_TRANSFER.slug,
				dependencies: {
					destination: 'migrate',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/processing',
				state: null,
			} );
		} );

		it( 'upgrade redirects from the import-from page to site-migration-upgrade-plan page', async () => {
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
	} );
} );
