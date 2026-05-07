/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
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
		const useAuthStatus = () => ( { needsReauth: false, isLoading: false } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.getByText( 'Timeline content' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /reconnect/i } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the overlay when needsReauth is true', () => {
		const useAuthStatus = () => ( { needsReauth: true, isLoading: false } );
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

	it( 'renders children optimistically when needsReauth is undefined and not loading', () => {
		const useAuthStatus = () => ( { needsReauth: undefined, isLoading: false } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.getByText( 'Timeline content' ) ).toBeVisible();
	} );

	it( 'renders children optimistically while loading', () => {
		const useAuthStatus = () => ( { needsReauth: undefined, isLoading: true } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( screen.getByText( 'Timeline content' ) ).toBeVisible();
	} );

	it( 'passes the connectionId to useAuthStatus', () => {
		const useAuthStatus = jest.fn().mockReturnValue( { needsReauth: false, isLoading: false } );
		render(
			<ConnectionReauthGate { ...baseProps } useAuthStatus={ useAuthStatus }>
				<div>Timeline content</div>
			</ConnectionReauthGate>
		);
		expect( useAuthStatus ).toHaveBeenCalledWith( 42 );
	} );
} );
