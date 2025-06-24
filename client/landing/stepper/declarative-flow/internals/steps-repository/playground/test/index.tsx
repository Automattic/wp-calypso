/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaygroundStep from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps, RenderStepOptions } from '../../test/helpers';
import { initializeWordPressPlayground } from '../lib/initialize-playground';

// Mock the initializeWordPressPlayground function
jest.mock( '../lib/initialize-playground' );

// Mock the PlaygroundError component to simplify testing
jest.mock( '../components/playground-error', () => ( {
	PlaygroundError: () => <div data-testid="playground-error">Playground Error Component</div>,
} ) );

let mockPlaygroundClientInstance;

const renderPlaygroundStep = (
	props?: Partial< StepProps >,
	renderOptions?: RenderStepOptions
) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <PlaygroundStep { ...combinedProps } />, renderOptions );
};

const getLaunchButton = () => screen.getByRole( 'button', { name: 'Launch on WordPress.com' } );

describe( 'Playground', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		mockPlaygroundClientInstance = {
			run: jest.fn().mockImplementation( () => Promise.resolve( { text: 'plans-playground' } ) ),
		};
		initializeWordPressPlayground.mockResolvedValue( mockPlaygroundClientInstance );
	} );

	describe( 'step', () => {
		it( 'should render the iframe and the launch button', async () => {
			let container;

			await act( async () => {
				const result = renderPlaygroundStep();
				container = result.container;
			} );

			expect( getLaunchButton() ).toBeVisible();
			expect( container.querySelector( 'iframe' ) ).toBeVisible();
		} );

		it( 'should change page when the user clicks the launch button', async () => {
			const submit = jest.fn();

			await act( async () => {
				renderPlaygroundStep( { navigation: { submit } } );
			} );

			await userEvent.click( getLaunchButton() );
			expect( submit ).toHaveBeenCalled();
		} );
	} );

	describe( 'PlaygroundIframe error handling', () => {
		it( 'should render PlaygroundError when initialization fails', async () => {
			initializeWordPressPlayground.mockRejectedValue(
				new Error( 'WordPress installation has failed.' )
			);

			await act( async () => renderPlaygroundStep() );

			// Verify the error component is displayed
			await waitFor( () => {
				expect( screen.getByTestId( 'playground-error' ) ).toBeVisible();
			} );
		} );
	} );
} );
