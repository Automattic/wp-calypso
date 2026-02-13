/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UnifiedInviteAccept } from '../index';

const mockRedirect = jest.fn();
jest.mock(
	'@automattic/calypso-router',
	() => ( {
		redirect: ( url: string ) => mockRedirect( url ),
		__esModule: true,
		default: {
			redirect: ( url: string ) => mockRedirect( url ),
		},
	} ),
	{ virtual: true }
);

// Mock AcceptInviteScreen to simplify testing
jest.mock( '../screens/accept-invite-screen', () => ( {
	__esModule: true,
	default: () => <div data-testid="accept-invite-screen">AcceptInviteScreen</div>,
} ) );

const mockStore = configureStore();

const defaultProps = {
	siteId: '123',
	inviteKey: 'abc123',
	inviteData: {
		blog_details: {
			title: 'Test Store',
			domain: 'test.store',
		},
		invite: {
			meta: {
				role: 'administrator',
			},
		},
	},
};

describe( 'UnifiedInviteAccept', () => {
	beforeEach( () => {
		mockRedirect.mockClear();
	} );

	test( 'redirects to legacy flow when user is not logged in', () => {
		const store = mockStore( {
			currentUser: {
				id: null,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } />
			</Provider>
		);

		expect( mockRedirect ).toHaveBeenCalledWith( '/accept-invite/123/abc123?legacy=1' );
	} );

	test( 'renders AcceptInviteScreen when user is logged in', () => {
		const store = mockStore( {
			currentUser: {
				id: 1,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } />
			</Provider>
		);

		expect( mockRedirect ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'accept-invite-screen' ) ).toBeInTheDocument();
	} );

	test( 'includes activationKey and authKey in legacy redirect path', () => {
		const store = mockStore( {
			currentUser: {
				id: null,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } activationKey="activation123" authKey="auth456" />
			</Provider>
		);

		expect( mockRedirect ).toHaveBeenCalledWith(
			'/accept-invite/123/abc123/activation123/auth456?legacy=1'
		);
	} );
} );
