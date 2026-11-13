/**
 * @vitest-environment jsdom
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
import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import React from 'react';
import { vi } from 'vitest';
import { AuthContext } from '../../auth';
import { useSurvicate } from '../index';
import type { User } from '@automattic/api-core';

vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( '@automattic/calypso-config', () => {
	const fn = vi.fn();
	return {
		...Object.assign( fn, {
			__esModule: true,
			default: fn,
			isEnabled: vi.fn(),
		} ),
	};
} );

vi.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: vi.fn(),
	loadSurvicateScript: vi.fn(),
	setSurvicateVisitorTraits: vi.fn(),
	getAccountAgeInDays: vi.fn( () => 42 ),
	SURVICATE_WORKSPACE_ID: 'test-workspace-id',
} ) );

vi.mock( '@wordpress/compose', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/compose' ) >( '@wordpress/compose' ) ),
	useViewportMatch: vi.fn(),
} ) );

const mockedConfig = vi.mocked( config );
const mockedShouldLoad = vi.mocked( shouldLoadSurvicate );
const mockedLoadScript = vi.mocked( loadSurvicateScript );
const mockedSetTraits = vi.mocked( setSurvicateVisitorTraits );
const mockedUseViewportMatch = vi.mocked( useViewportMatch );
const mockedRecordTracksEvent = vi.mocked( recordTracksEvent );

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

function renderWithAuth( user: User ) {
	return renderHook( () => useSurvicate(), {
		wrapper: ( { children } ) => (
			<AuthContext.Provider value={ { user, logout: vi.fn() } }>{ children }</AuthContext.Provider>
		),
	} );
}

describe( 'useSurvicate', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockedLoadScript.mockResolvedValue( undefined );
		mockedSetTraits.mockReturnValue( vi.fn() );
	} );

	test( 'loads script when all conditions are met', async () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedUseViewportMatch.mockReturnValue( false );

		const user = createUser();
		renderWithAuth( user );

		// Flush microtasks so the loadSurvicateScript promise resolves
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockedLoadScript ).toHaveBeenCalledWith(
			SURVICATE_WORKSPACE_ID,
			expect.any( AbortSignal )
		);
		expect( mockedSetTraits ).toHaveBeenCalledWith( {
			user_id: '1',
			email: 'test@example.com',
			account_age_in_days: 42,
		} );
	} );

	test( 'skips loading when config flag is disabled', () => {
		mockedConfig.mockReturnValue( false );

		const user = createUser();
		renderWithAuth( user );

		expect( mockedLoadScript ).not.toHaveBeenCalled();
	} );

	test( 'fires error event when user has no email', async () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedUseViewportMatch.mockReturnValue( false );

		const user = createUser( { email: '' } );
		renderWithAuth( user );

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

	test( 'handles script load failure gracefully', async () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedUseViewportMatch.mockReturnValue( false );
		mockedLoadScript.mockRejectedValue( new Error( 'Failed to load' ) );

		const user = createUser();

		// Should not throw
		renderWithAuth( user );

		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockedSetTraits ).not.toHaveBeenCalled();
	} );

	test( 'passes correct locale and isMobile to shouldLoadSurvicate', () => {
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( false );
		mockedUseViewportMatch.mockReturnValue( true );

		const user = createUser( { language: 'pt-br' } );
		renderWithAuth( user );

		expect( mockedShouldLoad ).toHaveBeenCalledWith( {
			locale: 'pt-br',
			isMobile: true,
		} );
	} );
} );
