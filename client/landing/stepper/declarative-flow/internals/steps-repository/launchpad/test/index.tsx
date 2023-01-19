/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { Site } from '@automattic/data-stores';
import { render } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import Launchpad from '../index';
import { buildSiteDetails, defaultSiteDetails } from './lib/fixtures';

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

	render( <TestLaunchpad { ...props } /> );
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
		jest.clearAllMocks();
	} );

	afterAll( () => {
		global.window = savedWindow;
	} );

	describe( 'when loading the Launchpad view', () => {
		describe( 'and the site is launchpad enabled', () => {
			it( 'does not redirect', () => {
				const initialReduxState = { currentUser: { id: user.ID } };
				renderLaunchpad( props, defaultSiteDetails, initialReduxState, siteSlug );
				expect( replaceMock ).not.toBeCalled();
			} );
		} );

		describe( 'and the site is not launchpad enabled', () => {
			it( 'redirects to Calypso My Home', () => {
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
