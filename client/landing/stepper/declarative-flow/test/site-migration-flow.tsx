/**
 * @jest-environment jsdom
 */
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';

describe( 'Site Migration Flow', () => {
	describe( 'navigation', () => {
		it( 'migrate redirects from the import-from page to site-migration-plugin-install page', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug,
				dependencies: {
					destination: 'migrate',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-plugin-install',
				state: { siteSlug: 'example.wordpress.com' },
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

		// TODO - This will need to be updated once the flow has been updated to include these steps.
		it( 'redirect from the processing page to the waitForPluginInstall when atomic waiting is finished', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
				dependencies: {
					finishedWaitingForAtomic: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/waitForPluginInstall',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );
	} );
} );
