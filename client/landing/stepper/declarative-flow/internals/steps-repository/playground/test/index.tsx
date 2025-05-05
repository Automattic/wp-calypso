/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaygroundStep from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps, RenderStepOptions } from '../../test/helpers';

// Be sure to mock this hook to return true so that the step is rendered.
jest.mock( 'calypso/landing/stepper/hooks/use-is-playground-eligible', () => ( {
	useIsPlaygroundEligible: () => true,
} ) );

// Mock the initializeWordPressPlayground function to cause an error
jest.mock( '../lib/initialize-playground', () => ( {
	initializeWordPressPlayground: () =>
		Promise.reject( new Error( 'WordPress installation has failed.' ) ),
} ) );

// Mock the PlaygroundError component to simplify testing
jest.mock( '../components/playground-error', () => ( {
	PlaygroundError: () => <div data-testid="playground-error">Playground Error Component</div>,
} ) );

const renderPlaygroundStep = (
	props?: Partial< StepProps >,
	renderOptions?: RenderStepOptions
) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <PlaygroundStep { ...combinedProps } />, renderOptions );
};

const getLaunchButton = () => screen.getByRole( 'button', { name: 'Launch on WordPress.com' } );

describe( 'Playground', () => {
	describe( 'step', () => {
		it( 'should render the iframe and the launch button', () => {
			const { container } = renderPlaygroundStep();

			expect( getLaunchButton() ).toBeVisible();
			expect( container.querySelector( 'iframe' ) ).toBeVisible();
		} );

		it( 'should change page when the user clicks the launch button', async () => {
			const submit = jest.fn();
			renderPlaygroundStep( { navigation: { submit } } );

			await userEvent.click( getLaunchButton() );
			expect( submit ).toHaveBeenCalled();
		} );
	} );

	describe( 'PlaygroundIframe error handling', () => {
		it( 'should render PlaygroundError when initialization fails', async () => {
			renderPlaygroundStep();

			// Verify the error component is displayed
			await waitFor( () => {
				expect( screen.getByTestId( 'playground-error' ) ).toBeVisible();
			} );
		} );
	} );
} );
