/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionReauthGate } from '../connection-reauth-gate';

describe( 'ConnectionReauthGate', () => {
	const baseProps = {
		connectionId: 42,
		reconnectUrl: 'https://example.test/reconnect/42',
		headline: 'Reconnect to update permissions',
		body: 'Your @jeherve@a8c.social connection needs to be refreshed.',
		buttonLabel: 'Reconnect on a8c.social',
	};

	it( 'renders children when needsReauth is false', () => {
		const useAuthStatus = () => ( { needsReauth: false } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.getByText( 'Timeline content' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /reconnect/i } ) ).not.toBeInTheDocument();
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
		const link = screen.getByRole( 'link', { name: 'Reconnect on a8c.social' } );
		expect( link ).toHaveAttribute( 'href', 'https://example.test/reconnect/42' );
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

	it( 'calls onReconnectClick when the reconnect link is activated (mousedown)', async () => {
		const user = userEvent.setup();
		const onReconnectClick = jest.fn();
		const useAuthStatus = () => ( { needsReauth: true } );
		render(
			<ConnectionReauthGate
				{ ...baseProps }
				useAuthStatus={ useAuthStatus }
				onReconnectClick={ onReconnectClick }
			>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		const link = screen.getByRole( 'link', { name: 'Reconnect on a8c.social' } );
		await user.click( link );
		expect( onReconnectClick ).toHaveBeenCalled();
	} );
} );
