/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialButton from '../index';

describe( 'SocialButton', () => {
	test( 'renders its label', () => {
		render( <SocialButton provider="google">Continue with Google</SocialButton> );

		expect( screen.getByRole( 'button', { name: /Continue with Google/i } ) ).toBeVisible();
	} );

	test( 'renders the provider icon', () => {
		const { container } = render(
			<SocialButton provider="google">Continue with Google</SocialButton>
		);

		expect( container.querySelector( '.social-icons__google' ) ).toBeInTheDocument();
	} );

	test( 'fires onClick when pressed', async () => {
		const onClick = jest.fn();
		render(
			<SocialButton provider="apple" onClick={ onClick }>
				Continue with Apple
			</SocialButton>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue with Apple/i } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'respects the disabled prop', async () => {
		const onClick = jest.fn();
		render(
			<SocialButton provider="github" onClick={ onClick } disabled>
				Continue with GitHub
			</SocialButton>
		);

		const button = screen.getByRole( 'button', { name: /Continue with GitHub/i } );
		expect( button ).toBeDisabled();
		await userEvent.click( button );
		expect( onClick ).not.toHaveBeenCalled();
	} );
} );
