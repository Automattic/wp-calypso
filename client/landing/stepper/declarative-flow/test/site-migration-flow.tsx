/**
 * @jest-environment jsdom
 */
import siteMigrationFlow from '../site-migration-flow';
import { getFlowLocation, renderFlow } from './helpers';

describe( 'Site Migration Flow', () => {
	describe( 'navigation', () => {
		it( 'navigates from import to waitForAtomic', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteMigrationFlow );

			runUseStepNavigationSubmit( { currentStep: 'import' } );

			expect( getFlowLocation() ).toEqual( {
				path: '/waitForAtomic',
				state: { siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'navigates from processing to waitForPluginInstall when atomic is finished', () => {
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
