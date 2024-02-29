/**
 * @jest-environment jsdom
 */
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';

describe( 'Site Migration Flow', () => {
	describe( 'navigation', () => {
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
