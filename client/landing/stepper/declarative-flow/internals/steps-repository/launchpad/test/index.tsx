/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { Site } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import nock from 'nock';
import React from 'react';
import * as ReactQuery from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import Launchpad from '../index';
import { buildSiteDetails, defaultSiteDetails, MOCK_USE_QUERY_RESULT } from './lib/fixtures';

jest.mock( '../launchpad-site-preview', () => () => {
	return <div></div>;
} );

jest.mock( 'calypso/data/domains/use-get-domains-query', () => ( {
	useGetDomainsQuery: () => ( {
		isLoading: true,
		data: [
			{
				domain: 'testlinkinbio.wordpress.com',
				wpcom_domain: true,
			},
		],
	} ),
} ) );

jest.mock( 'calypso/state/sites/hooks/use-premium-global-styles', () => ( {
	usePremiumGlobalStyles: () => ( {
		shouldLimitGlobalStyles: false,
		globalStylesInUse: false,
	} ),
} ) );

// JSDOM doesn't support browser navigation, so we temporarily mock the
// window.location object
const replaceMock = jest.fn();
declare global {
	interface Window {
		initialReduxState: object;
	}
}
const savedWindow = window;
global.window = Object.create( window );
Object.defineProperty( window, 'location', {
	value: { replace: replaceMock },
} );

const siteSlug = `testlinkinbio.wordpress.com`;
const user = {
	ID: 1234,
	username: 'testUser',
	email: 'testEmail@gmail.com',
};

function renderLaunchpad(
	props = {},
	siteDetails = defaultSiteDetails,
	initialReduxState = {},
	siteSlug = ''
): void {
	function TestLaunchpad( props ) {
		window.initialReduxState = initialReduxState;
		const initialState = getInitialState( initialReducer, user.ID );
		const reduxStore = createReduxStore( initialState, initialReducer );
		setStore( reduxStore, getStateFromCache( user.ID ) );

		const SITE_STORE = Site.register( {
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_id' ),
		} );

		const { receiveSite } = useDispatch( SITE_STORE );

		receiveSite( siteDetails.ID, siteDetails );

		return (
			<Provider store={ reduxStore }>
				<MemoryRouter initialEntries={ [ `/setup/link-in-bio/launchpad?siteSlug=${ siteSlug }` ] }>
					<Launchpad { ...props } />
				</MemoryRouter>
			</Provider>
		);
	}

	renderWithProvider( <TestLaunchpad { ...props } /> );
}

describe( 'Launchpad', () => {
	const props = {
		siteSlug,
		/* eslint-disable @typescript-eslint/no-empty-function */
		navigation: {
			submit: () => {},
			goNext: () => {},
			goToStep: () => {},
		},
		/* eslint-enable @typescript-eslint/no-empty-function */
	};

	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/wpcom/v2/sites/${ siteSlug }/launchpad` )
			.reply( 200, {
				checklist_statuses: {},
				launchpad_screen: 'full',
				site_intent: '',
			} );
		jest.clearAllMocks();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	afterAll( () => {
		global.window = savedWindow;
	} );

	describe( 'when loading the Launchpad view', () => {
		describe( 'and the site is launchpad enabled', () => {
			it( 'does not redirect', () => {
				jest
					.spyOn( ReactQuery, 'useQuery' )
					.mockImplementation(
						jest
							.fn()
							.mockReturnValue( { ...MOCK_USE_QUERY_RESULT, data: { launchpad_screen: 'full' } } )
					);
				const initialReduxState = { currentUser: { id: user.ID } };
				renderLaunchpad( props, defaultSiteDetails, initialReduxState, siteSlug );
				expect( replaceMock ).not.toBeCalled();
			} );
		} );

		describe( 'and the site is not launchpad enabled', () => {
			it( 'redirects to Calypso My Home', () => {
				jest
					.spyOn( ReactQuery, 'useQuery' )
					.mockImplementation(
						jest
							.fn()
							.mockReturnValue( { ...MOCK_USE_QUERY_RESULT, data: { launchpad_screen: 'off' } } )
					);
				const initialReduxState = { currentUser: { id: user.ID } };
				renderLaunchpad(
					props,
					buildSiteDetails( {
						options: {
							...defaultSiteDetails.options,
							launchpad_screen: 'off',
						},
					} ),
					initialReduxState,
					siteSlug
				);
				expect( replaceMock ).toBeCalledTimes( 1 );
				expect( replaceMock ).toBeCalledWith( `/home/${ siteSlug }` );
			} );
		} );

		describe( 'user is logged out', () => {
			it( 'should redirect user to Calypso My Home', () => {
				renderLaunchpad(
					props,
					buildSiteDetails( {
						options: {
							...defaultSiteDetails.options,
							launchpad_screen: 'off',
						},
					} ),
					{},
					siteSlug
				);
				expect( replaceMock ).toBeCalledWith( `/home/${ siteSlug }` );
			} );
		} );

		describe( 'site slug does not exist', () => {
			it( 'should redirect user to Calypso My Home', () => {
				const initialReduxState = { currentUser: { id: user.ID } };
				renderLaunchpad(
					props,
					buildSiteDetails( {
						options: {
							...defaultSiteDetails.options,
							launchpad_screen: 'off',
						},
					} ),
					initialReduxState,
					''
				);
				expect( replaceMock ).toBeCalledWith( `/home` );
			} );
		} );
	} );
} );
