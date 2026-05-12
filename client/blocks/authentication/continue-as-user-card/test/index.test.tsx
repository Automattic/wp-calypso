/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContinueAsUserCard from '../index';

const defaultProps = {
	avatarUrl: 'https://gravatar.com/avatar/0?d=mp&s=96',
	name: 'Jane Doe',
	email: 'jane@example.com',
	continueLabel: 'Continue as Jane Doe',
	switchAccountLabel: 'Log in with another account',
	onContinue: jest.fn(),
	onSwitchAccount: jest.fn(),
};

describe( 'ContinueAsUserCard', () => {
	test( 'renders the user name and email', () => {
		render( <ContinueAsUserCard { ...defaultProps } /> );

		expect( screen.getByText( 'Jane Doe' ) ).toBeVisible();
		expect( screen.getByText( 'jane@example.com' ) ).toBeVisible();
	} );

	test( 'fires onContinue when the primary button is pressed', async () => {
		const onContinue = jest.fn();
		render( <ContinueAsUserCard { ...defaultProps } onContinue={ onContinue } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue as Jane Doe' } ) );

		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'fires onSwitchAccount when the link button is pressed', async () => {
		const onSwitchAccount = jest.fn();
		render( <ContinueAsUserCard { ...defaultProps } onSwitchAccount={ onSwitchAccount } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Log in with another account' } ) );

		expect( onSwitchAccount ).toHaveBeenCalledTimes( 1 );
	} );
} );
