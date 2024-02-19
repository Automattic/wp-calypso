/**
 * @jest-environment jsdom
 */
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';

describe( 'Site Migration Flow', () => {
	describe( 'navigation', () => {
		it( 'redirects from the import page to waitForAtomic page', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( { currentStep: 'import' } );

			expect( getFlowLocation() ).toEqual( {
				path: '/waitForAtomic',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

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
