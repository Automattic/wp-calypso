/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FreeSetup from '../index';

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/free/freeSetup',
		hash: '',
		state: undefined,
	} ) ),
} ) );

const middlewares = [ thunk ];

const mockStore = configureStore( middlewares );

const renderComponent = ( component, initialState = {} ) => {
	const queryClient = new QueryClient();
	const store = mockStore( {
		'automattic/onboard': {},
		...initialState,
	} );

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ component }</QueryClientProvider>
		</Provider>
	);
};

describe( 'Onboarding Free Flow - FreeSetup', () => {
	const user = userEvent.setup();
	const navigation = {
		goBack: jest.fn(),
		goNext: jest.fn(),
		submit: jest.fn(),
	};

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Initial screen render', () => {
		it( 'should render successfully', async () => {
			renderComponent( <FreeSetup flow="free" navigation={ navigation } /> );

			await waitFor( () => {
				expect( screen.getByText( 'Personalize your Site' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Site name' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Brief description' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Jetpack powered' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'FreeSetup form submission', () => {
		it( 'should submit form if Site name field is not empty', async () => {
			const freeSetupComponent = renderComponent(
				<FreeSetup flow="free" navigation={ navigation } />
			);

			await act( async () => {
				const siteNameInputField = await freeSetupComponent.getByPlaceholderText( 'My Website' );
				await userEvent.type( siteNameInputField, 'site name' );
				await user.click( screen.getByText( 'Continue' ) );
			} );

			expect( navigation.submit ).toHaveBeenCalled();
		} );

		it( 'should not submit form if Site name field is empty', async () => {
			const freeSetupComponent = renderComponent(
				<FreeSetup flow="free" navigation={ navigation } />
			);

			await waitFor( async () => {
				const siteNameInputField = await freeSetupComponent.getByPlaceholderText( 'My Website' );
				await userEvent.clear( siteNameInputField );
				await user.click( screen.getByText( 'Continue' ) );
			} );

			expect( navigation.submit ).not.toHaveBeenCalled();
		} );
	} );
} );
