/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PlaygroundStep from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps, RenderStepOptions } from '../../test/helpers';

// Be sure to mock this hook to return true so that the step is rendered.
jest.mock( 'calypso/landing/stepper/hooks/use-is-playground-eligible', () => ( {
	useIsPlaygroundEligible: () => true,
} ) );

const renderPlaygroundStep = (
	props?: Partial< StepProps >,
	renderOptions?: RenderStepOptions
) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <PlaygroundStep { ...combinedProps } />, renderOptions );
};

const launchButton = () => screen.getByRole( 'button', { name: 'Launch on WordPress.com' } );

describe( 'Playground', () => {
	describe( 'step', () => {
		it( 'should render the iframe and the launch button', () => {
			const { container } = renderPlaygroundStep();

			expect( launchButton() ).toBeInTheDocument();
			expect( container.querySelector( 'iframe' ) ).toBeInTheDocument();
		} );

		it( 'should change page when the user clicks the launch button', async () => {
			const submit = jest.fn();
			renderPlaygroundStep( { navigation: { submit } } );

			await waitFor( async () => {
				await userEvent.click( launchButton() );
			} );

			expect( submit ).toHaveBeenCalled();
		} );
	} );
} );
