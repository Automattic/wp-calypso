/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ConnectionReauthTag } from '../connection-reauth-tag';

describe( 'ConnectionReauthTag', () => {
	it( 'renders the tag when needsReauth is true', () => {
		const useAuthStatus = () => ( { needsReauth: true } );
		render(
			<ConnectionReauthTag
				connectionId={ 42 }
				useAuthStatus={ useAuthStatus }
				label="Needs reconnect"
			/>
		);
		expect( screen.getByText( 'Needs reconnect' ) ).toBeVisible();
	} );

	it( 'renders nothing when needsReauth is false', () => {
		const useAuthStatus = () => ( { needsReauth: false } );
		const { container } = render(
			<ConnectionReauthTag
				connectionId={ 42 }
				useAuthStatus={ useAuthStatus }
				label="Needs reconnect"
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when needsReauth is undefined', () => {
		const useAuthStatus = () => ( { needsReauth: undefined } );
		const { container } = render(
			<ConnectionReauthTag
				connectionId={ 42 }
				useAuthStatus={ useAuthStatus }
				label="Needs reconnect"
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'passes the connectionId to useAuthStatus', () => {
		const useAuthStatus = jest.fn().mockReturnValue( { needsReauth: false } );
		render(
			<ConnectionReauthTag
				connectionId={ 42 }
				useAuthStatus={ useAuthStatus }
				label="Needs reconnect"
			/>
		);
		expect( useAuthStatus ).toHaveBeenCalledWith( 42 );
	} );
} );
