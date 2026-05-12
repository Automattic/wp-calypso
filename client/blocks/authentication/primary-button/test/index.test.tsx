/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryButton from '../index';

describe( 'PrimaryButton', () => {
	test( 'renders its children', () => {
		render( <PrimaryButton>Continue</PrimaryButton> );

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeVisible();
	} );

	test( 'fires onClick when pressed', async () => {
		const onClick = jest.fn();
		render( <PrimaryButton onClick={ onClick }>Continue</PrimaryButton> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'respects the disabled prop', async () => {
		const onClick = jest.fn();
		render(
			<PrimaryButton onClick={ onClick } disabled>
				Continue
			</PrimaryButton>
		);

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		expect( button ).toBeDisabled();

		await userEvent.click( button );
		expect( onClick ).not.toHaveBeenCalled();
	} );

	test( 'applies the is-busy class when isBusy is true', () => {
		render( <PrimaryButton isBusy>Continue</PrimaryButton> );

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveClass( 'is-busy' );
	} );
} );
