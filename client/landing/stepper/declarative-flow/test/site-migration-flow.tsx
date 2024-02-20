/**
 * @jest-environment jsdom
 */
import { STEPS } from '../internals/steps';
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';

describe( 'Site Migration Flow', () => {
	describe( 'navigation', () => {
		it( 'redirects from the import page to waitForAtomic page', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( { currentStep: STEPS.SITE_MIGRATION_SOURCE.slug } );

			expect( getFlowLocation() ).toEqual( {
				path: '/site-migration-plugin-install',
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
