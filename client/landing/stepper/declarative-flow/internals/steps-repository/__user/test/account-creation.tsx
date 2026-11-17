/**
 * @jest-environment jsdom
 */

jest.mock( 'wpcom-proxy-request', () => ( {
	...jest.requireActual( 'wpcom-proxy-request' ),
	reloadProxy: jest.fn(),
	requestAllBlogsAccess: jest.fn(),
} ) );

jest.mock( 'calypso/lib/user/shared-utils', () => ( {
	...jest.requireActual( 'calypso/lib/user/shared-utils' ),
	rawCurrentUserFetch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	usePartnerBranding: () => ( { hasCustomBranding: false, partnerConfig: null } ),
} ) );

// Stands in for the form's `goToNextStep` call after `/users/new` succeeds.
jest.mock( 'calypso/blocks/signup-form/signup-form-social-first', () => ( {
	__esModule: true,
	default: ( {
		goToNextStep,
	}: {
		goToNextStep: ( data: { bearer_token: string; username: string } ) => void;
	} ) => (
		<button onClick={ () => goToNextStep( { bearer_token: 'token', username: 'newuser' } ) }>
			Create account
		</button>
	),
} ) );

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { reloadProxy } from 'wpcom-proxy-request';
import { rawCurrentUserFetch } from 'calypso/lib/user/shared-utils';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';

const mockReloadProxy = reloadProxy as jest.Mock;
const mockRawCurrentUserFetch = rawCurrentUserFetch as jest.Mock;

const NEW_USER = { ID: 1, username: 'newuser', email: 'newuser@example.com' };
const LOGGED_OUT = new Error( 'Not logged in' );

describe( 'User step account creation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const renderUserStep = () => {
		const navigation = { submit: jest.fn() };
		renderWithProvider(
			<MemoryRouter initialEntries={ [ '/onboarding/user' ] }>
				<UserStep flow="onboarding" stepName="user" navigation={ navigation } />
			</MemoryRouter>
		);
		return navigation;
	};

	it( 'reloads the proxy once for the new account and submits once its user loads', async () => {
		mockRawCurrentUserFetch.mockRejectedValueOnce( LOGGED_OUT ).mockResolvedValue( NEW_USER );
		const navigation = renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );

		await waitFor( () => expect( navigation.submit ).toHaveBeenCalled() );
		expect( mockReloadProxy ).toHaveBeenCalledTimes( 1 );
		expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'fetches the new user again when the reload fails a `/me` sent before it', async () => {
		let failPendingFetch: ( error: Error ) => void = () => {};
		mockRawCurrentUserFetch
			.mockReturnValueOnce(
				new Promise( ( resolve, reject ) => {
					failPendingFetch = reject;
				} )
			)
			.mockResolvedValue( NEW_USER );
		// The proxy fails what was in flight on the iframe it replaces.
		mockReloadProxy.mockImplementation( () => failPendingFetch( LOGGED_OUT ) );
		const navigation = renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );

		await waitFor( () => expect( navigation.submit ).toHaveBeenCalled() );
		expect( mockRawCurrentUserFetch ).toHaveBeenLastCalledWith( { retry: true } );
	} );
} );
