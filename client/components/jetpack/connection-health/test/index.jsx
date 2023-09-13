/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { merge } from 'lodash';
import { jetpackConnectionHealth } from 'calypso/state/jetpack-connection-health/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { JetpackConnectionHealthBanner } from '..';
import {
	DATABASE_ERROR,
	FATAL_ERROR,
	USER_TOKEN_ERROR,
	BLOG_TOKEN_ERROR,
	HTTP_ERROR,
	INACTIVITY_ERROR,
	PLUGIN_ERROR,
	DNS_ERROR,
	UNKNOWN_ERROR,
	GENERIC_ERROR,
	XMLRPC_ERROR,
	REST_API_ERROR,
} from '../constants';

const mockError = jest.fn().mockReturnValue( UNKNOWN_ERROR );

jest.mock(
	'calypso/components/jetpack/connection-health/use-check-jetpack-connection-health',
	() => ( {
		useCheckJetpackConnectionHealth: jest.fn( () => ( {
			data: { is_healthy: false, error: mockError() },
		} ) ),
	} )
);

const initialReduxState = {
	sites: {
		items: { 1: { ID: 1, title: 'Test Site', jetpack: true } },
	},
};

const render = ( el, options = {} ) =>
	renderWithProvider( el, {
		...options,
		initialState: merge( initialReduxState, options.initialState ),
		reducers: { jetpackConnectionHealth },
	} );

describe( 'JetpackConnectionHealthBanner', () => {
	describe( 'component rendering', () => {
		test( 'shows generic message', () => {
			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect( screen.queryByText( /Jetpack can’t communicate with your site./i ) ).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows a database connection error message', () => {
			mockError.mockReturnValue( DATABASE_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText( /Jetpack can’t establish a connection to your site’s database./i )
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows fatal error message', () => {
			mockError.mockReturnValue( FATAL_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site due to a critical error on the site./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows dns error message', () => {
			mockError.mockReturnValue( DNS_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect( screen.queryByText( /Jetpack is unable to connect to your domain/i ) ).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows user token error message', () => {
			mockError.mockReturnValue( USER_TOKEN_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site because your site isn’t connected./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to reconnect Jetpack/i ) ).toBeVisible();
		} );

		test( 'shows blog token error message', () => {
			mockError.mockReturnValue( BLOG_TOKEN_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site because your site isn’t connected./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to reconnect Jetpack/i ) ).toBeVisible();
		} );

		test( 'shows http error message', () => {
			mockError.mockReturnValue( HTTP_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site because your site isn’t responding to requests./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows inactivity error message', () => {
			mockError.mockReturnValue( INACTIVITY_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site because it hasn't seen your site for 7 days./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows an XML-RPC error message', () => {
			mockError.mockReturnValue( XMLRPC_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site because XML-RPC is not responding correctly./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows a REST API error message', () => {
			mockError.mockReturnValue( REST_API_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site because the REST API is not responding correctly./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows plugin error message', () => {
			mockError.mockReturnValue( PLUGIN_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/We can’t communicate with your site because the Jetpack plugin is deactivated./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to reactivate Jetpack/i ) ).toBeVisible();
		} );

		test( 'shows generic error message', () => {
			mockError.mockReturnValue( GENERIC_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText(
					/Jetpack can’t communicate with your site. Please contact site administrator./i
				)
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).not.toBeInTheDocument();
		} );
	} );
} );
