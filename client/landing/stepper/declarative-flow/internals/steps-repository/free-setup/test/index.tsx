/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as wpcomProxyRequest from 'wpcom-proxy-request';
import wpcomXhrRequest from 'wpcom-xhr-request';
import FreeSetup from '../index';
import { generateRandomDomainSuggestion } from '../mocks';

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/free/freeSetup',
		search: '?siteSlug=test.wordpress.com',
		hash: '',
		state: undefined,
	} ) ),
} ) );

jest.mock( 'wpcom-proxy-request', () => jest.requireActual( 'wpcom-proxy-request' ) );

/**
 * Mock wpcom-proxy-request so that we could use wpcom-xhr-request to call the endpoint
 * and get the response from nock
 */
jest
	.spyOn( wpcomProxyRequest, 'default' )
	.mockImplementation(
		( ...args ) =>
			new Promise( ( resolve, reject ) =>
				wpcomXhrRequest( ...args, ( err, res ) => ( err ? reject( err ) : resolve( res ) ) )
			)
	);

const middlewares = [ thunk ];

const mockStore = configureStore( middlewares );

const renderComponent = ( component, initialState = {} ) => {
	const queryClient = new QueryClient();
	const store = mockStore( {
		onboarding: {},
		...initialState,
	} );

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ component }</QueryClientProvider>
		</Provider>
	);
};

describe( 'FreeSetup', () => {
	let originalScrollTo;
	// const user = userEvent.setup();

	const navigation = {
		goBack: jest.fn(),
		goNext: jest.fn(),
		submit: jest.fn(),
	};

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = jest.fn();

		nock( 'https://public-api.wordpress.com/rest/v1.1' )
			.persist()
			.get( '/domains/suggestions' )
			.query( {
				managed_subdomains: 'wordpress.com',
				managed_subdomain_options: 'random_name',
				managed_subdomain_quantity: 1,
				quantity: 1,
				http_envelope: 1,
			} )
			.reply( 200, generateRandomDomainSuggestion );
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;

		nock.cleanAll();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basics', () => {
		it( 'should render successfully', async () => {
			const { container } = renderComponent( <FreeSetup flow="free" navigation={ navigation } /> );

			await waitFor( () => {
				expect( screen.getByText( 'Personalize your site' ) ).toBeInTheDocument();
				expect(
					container.getElementsByClassName( 'setup-form-field-set-domain-name' )
				).toHaveLength( 0 );
			} );
		} );
	} );

	// describe( 'Submit free setup form', () => {
	// 	it( 'should call submit successfully', async () => {
	// 		const utils = renderComponent( <FreeSetup flow="free" navigation={ navigation } /> );

	// 		await act( async () => {
	// 			const siteNameInputField = await utils.getByPlaceholderText( 'My Website' );
	// 			// const siteNameInputField = await container.queryByLabelText( '#free-setup-header' );
	// 			await userEvent.type( siteNameInputField, 'site name' );
	// 			await user.click( screen.getByText( 'Continue' ) );
	// 		} );

	// 		expect( navigation.submit ).toHaveBeenCalled();
	// 	} );
	// } );
} );
