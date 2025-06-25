/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import FreeFlowPostSetup from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/free-post-setup/index';
import * as useSiteModule from 'calypso/landing/stepper/hooks/use-site';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { defaultSiteDetails, buildSiteDetails } from './lib/fixtures';

jest.mock( 'react-router-dom', () => ( {
	...( jest.requireActual( 'react-router-dom' ) as Record< string, unknown > ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/free-post-setup/freePostSetup',
		hash: '',
		state: undefined,
	} ) ),
} ) );

jest.mock( '@wordpress/data' );

describe( 'Onboarding Free Flow - FreeSetup', () => {
	const user = userEvent.setup();
	const navigation = {
		goBack: jest.fn(),
		goNext: jest.fn(),
		submit: jest.fn(),
	};
	const useDispatchMock = useDispatch as jest.Mock;
	const useSiteMock = jest.spyOn( useSiteModule, 'useSite' );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Initial screen render', () => {
		it( 'should render successfully', async () => {
			useDispatchMock.mockImplementation( () => {
				return { saveSiteSettings: jest.fn() };
			} );
			renderWithProvider( <FreeFlowPostSetup flow="free" navigation={ navigation } /> );

			await waitFor( () => {
				expect( screen.getByText( 'Personalize your Site' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Site name' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Brief description' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Jetpack powered' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Add a site icon' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'FreeSetup form submission', () => {
		it( 'should not submit form and display error if Site name field is empty', async () => {
			useDispatchMock.mockImplementation( () => {
				return { saveSiteSettings: jest.fn() };
			} );
			useSiteMock.mockReturnValue(
				buildSiteDetails( {
					name: undefined,
				} )
			);

			renderWithProvider( <FreeFlowPostSetup flow="free" navigation={ navigation } /> );

			await waitFor( async () => {
				await user.click( screen.getByText( 'Continue' ) );
			} );

			expect( navigation.submit ).not.toHaveBeenCalled();
			expect(
				screen.getByText( "Oops. Looks like your website doesn't have a name yet." )
			).toBeInTheDocument();
		} );

		it( 'should submit form if Site name field is not empty', async () => {
			useDispatchMock.mockImplementation( () => {
				return { saveSiteSettings: jest.fn() };
			} );
			useSiteMock.mockReturnValue( defaultSiteDetails );
			renderWithProvider( <FreeFlowPostSetup flow="free" navigation={ navigation } /> );

			await act( async () => {
				await user.click( screen.getByText( 'Continue' ) );
			} );

			expect( navigation.submit ).toHaveBeenCalled();
		} );

		it( 'should display form error if an exception thrown', async () => {
			useDispatchMock.mockImplementation( () => {
				return {
					saveSiteSettings: jest.fn( () => {
						throw new Error();
					} ),
				};
			} );
			useSiteMock.mockReturnValue( defaultSiteDetails );
			renderWithProvider( <FreeFlowPostSetup flow="free" navigation={ navigation } /> );

			await act( async () => {
				await user.click( screen.getByText( 'Continue' ) );
			} );

			expect( navigation.submit ).not.toHaveBeenCalled();
			expect(
				screen.getByText( 'Oops, there was an issue! Please try again.' )
			).toBeInTheDocument();
		} );
	} );
} );
