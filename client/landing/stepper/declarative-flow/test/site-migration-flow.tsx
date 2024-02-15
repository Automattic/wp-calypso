/**
 * @jest-environment jsdom
 */
import React from 'react';
import { MemoryRouter } from 'react-router';
import { renderWithProvider } from '../../../../test-helpers/testing-library';
import siteMigrationFlow from '../site-migration-flow';

const FakeStepRender = ( { currentStep, navigate, submitParams } ) => {
	const { submit } = siteMigrationFlow.useStepNavigation( currentStep, navigate );

	if ( submit ) {
		submit( submitParams );
	}
	return null;
};

describe( 'Site Migration Flow', () => {
	describe( 'navigation', () => {
		const render = ( { currentStep, navigate }, submitParams = {} ) => {
			renderWithProvider(
				<MemoryRouter initialEntries={ [ '/some-path?siteSlug=example.wordpress.com' ] }>
					<FakeStepRender
						currentStep={ currentStep }
						navigate={ navigate }
						submitParams={ submitParams }
					/>
				</MemoryRouter>
			);
		};

		it( 'navigates from import to waitForAtomic', () => {
			const navigate = jest.fn();
			render( { currentStep: 'import', navigate } );

			expect( navigate ).toHaveBeenCalledWith( 'waitForAtomic', {
				siteSlug: 'example.wordpress.com',
			} );
		} );

		it( 'navigates from processing to waitForAtomic', () => {
			const navigate = jest.fn();
			render( { currentStep: 'waitForAtomic', navigate } );

			expect( navigate ).toHaveBeenCalledWith( 'processing', {
				currentStep: 'waitForAtomic',
			} );
		} );

		it( 'navigates from processing to waitForPlugin when the atomic is ready', () => {
			const navigate = jest.fn();
			render( { currentStep: 'processing', navigate }, { finishedWaitingForAtomic: true } );

			expect( navigate ).toHaveBeenCalledWith( 'waitForPluginInstall', {
				siteSlug: 'example.wordpress.com',
			} );
		} );
	} );
} );
