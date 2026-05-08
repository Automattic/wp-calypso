/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionReauthGate } from '../connection-reauth-gate';

describe( 'ConnectionReauthGate', () => {
	const baseProps = {
		connectionId: 42,
		headline: 'Reconnect to update permissions',
		body: 'Your @jeherve@a8c.social connection needs to be refreshed.',
		buttonLabel: 'Reconnect on a8c.social',
		onReconnect: () => {},
	};

	it( 'renders children when needsReauth is false', () => {
		const useAuthStatus = () => ( { needsReauth: false } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.getByText( 'Timeline content' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /reconnect/i } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the overlay when needsReauth is true', () => {
		const useAuthStatus = () => ( { needsReauth: true } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.queryByText( 'Timeline content' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Reconnect to update permissions' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Your @jeherve@a8c.social connection needs to be refreshed.' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Reconnect on a8c.social' } ) ).toBeVisible();
	} );

	it( 'renders children optimistically when needsReauth is undefined (loading or error)', () => {
		const useAuthStatus = () => ( { needsReauth: undefined } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.getByText( 'Timeline content' ) ).toBeVisible();
	} );

	it( 'passes the connectionId to useAuthStatus', () => {
		const useAuthStatus = jest.fn().mockReturnValue( { needsReauth: false } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( useAuthStatus ).toHaveBeenCalledWith( 42 );
	} );

	it( 'calls onReconnect when the reconnect button is clicked', async () => {
		const user = userEvent.setup();
		const onReconnect = jest.fn();
		const useAuthStatus = () => ( { needsReauth: true } );
		render(
			<ConnectionReauthGate
				{ ...baseProps }
				useAuthStatus={ useAuthStatus }
				onReconnect={ onReconnect }
			>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		const button = screen.getByRole( 'button', { name: 'Reconnect on a8c.social' } );
		await user.click( button );
		expect( onReconnect ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables the button while isReconnecting and suppresses additional onReconnect calls', async () => {
		const user = userEvent.setup();
		const onReconnect = jest.fn();
		const useAuthStatus = () => ( { needsReauth: true } );
		render(
			<ConnectionReauthGate
				{ ...baseProps }
				useAuthStatus={ useAuthStatus }
				onReconnect={ onReconnect }
				isReconnecting
			>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		const button = screen.getByRole( 'button', { name: 'Reconnect on a8c.social' } );
		expect( button ).toBeDisabled();
		await user.click( button );
		expect( onReconnect ).not.toHaveBeenCalled();
	} );
} );
