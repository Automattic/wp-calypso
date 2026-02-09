/**
 * @jest-environment jsdom
 */

// eslint-disable-next-line no-restricted-imports
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { render } from '@testing-library/react';
import React from 'react';
import { AuthContext } from '../../auth';
import { SurvicateProvider } from '../index';
import type { User } from '@automattic/api-core';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn();
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn(),
	} );
} );

jest.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: jest.fn(),
	loadSurvicateScript: jest.fn(),
	setSurvicateVisitorTraits: jest.fn(),
	SURVICATE_WORKSPACE_ID: 'test-workspace-id',
} ) );

jest.mock( '@automattic/viewport', () => ( {
	isMobile: jest.fn(),
} ) );

const mockedConfig = jest.mocked( config );
const mockedShouldLoad = jest.mocked( shouldLoadSurvicate );
const mockedLoadScript = jest.mocked( loadSurvicateScript );
const mockedSetTraits = jest.mocked( setSurvicateVisitorTraits );
const mockedIsMobile = jest.mocked( isMobile );
const mockedRecordTracksEvent = jest.mocked( recordTracksEvent );

function createUser( overrides: Partial< User > = {} ): User {
	return {
		ID: 1,
		display_name: 'Test User',
		username: 'testuser',
		email: 'test@example.com',
		primary_blog: 123,
		primary_blog_url: 'https://test.wordpress.com',
		language: 'en',
		locale_variant: '',
		site_count: 1,
		visible_site_count: 1,
		...overrides,
	} as User;
}

function renderWithAuth( user: User, children: React.ReactNode ) {
	return render(
		<AuthContext.Provider value={ { user, logout: jest.fn() } }>{ children }</AuthContext.Provider>
	);
}

describe( 'SurvicateProvider', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedLoadScript.mockResolvedValue( undefined );
	} );

	test( 'loads script when all conditions are met', async () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedIsMobile.mockReturnValue( false );

		const user = createUser();
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		// Flush microtasks so the loadSurvicateScript promise resolves
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockedLoadScript ).toHaveBeenCalledWith( SURVICATE_WORKSPACE_ID );
		expect( mockedSetTraits ).toHaveBeenCalledWith( { email: 'test@example.com' } );
	} );

	test( 'skips loading when config flag is disabled', () => {
		mockedConfig.mockReturnValue( false );

		const user = createUser();
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		expect( mockedLoadScript ).not.toHaveBeenCalled();
	} );

	test( 'skips loading when locale is non-English', () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( false );

		const user = createUser( { language: 'fr' } );
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		expect( mockedLoadScript ).not.toHaveBeenCalled();
	} );

	test( 'skips loading on mobile devices', () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( false );
		mockedIsMobile.mockReturnValue( true );

		const user = createUser();
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		expect( mockedLoadScript ).not.toHaveBeenCalled();
	} );

	test( 'fires error event when user has no email', async () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedIsMobile.mockReturnValue( false );

		const user = createUser( { email: '' } );
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		// Flush promises
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockedLoadScript ).toHaveBeenCalled();
		expect( mockedSetTraits ).not.toHaveBeenCalled();
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_survicate_user_not_available_error',
			expect.objectContaining( {
				user_exists: true,
				user_has_email: false,
			} )
		);
	} );

	test( 'renders children', () => {
		mockedConfig.mockReturnValue( false );

		const user = createUser();
		const { getByText } = renderWithAuth(
			user,
			<SurvicateProvider>
				<div>test child content</div>
			</SurvicateProvider>
		);

		expect( getByText( 'test child content' ) ).toBeVisible();
	} );

	test( 'handles script load failure gracefully', async () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedIsMobile.mockReturnValue( false );
		mockedLoadScript.mockRejectedValue( new Error( 'Failed to load' ) );

		const user = createUser();

		// Should not throw
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockedSetTraits ).not.toHaveBeenCalled();
	} );

	test( 'passes correct locale and isMobile to shouldLoadSurvicate', () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( false );
		mockedIsMobile.mockReturnValue( true );

		const user = createUser( { language: 'pt-br' } );
		renderWithAuth(
			user,
			<SurvicateProvider>
				<div>child</div>
			</SurvicateProvider>
		);

		expect( mockedShouldLoad ).toHaveBeenCalledWith( {
			locale: 'pt-br',
			isMobile: true,
		} );
	} );
} );
