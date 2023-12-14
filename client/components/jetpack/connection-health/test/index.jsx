/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { merge } from 'lodash';
import { reducer as jetpackConnectionHealth } from 'calypso/state/jetpack-connection-health/reducer';
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							error: UNKNOWN_ERROR,
							jetpack_connection_problem: true,
						},
					},
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect( screen.queryByText( /Jetpack can’t communicate with your site./i ) ).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows a database connection error message', () => {
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = DATABASE_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect(
				screen.queryByText( /Jetpack can’t establish a connection to your site’s database./i )
			).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows fatal error message', () => {
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = FATAL_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = DNS_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect( screen.queryByText( /Jetpack is unable to connect to your domain/i ) ).toBeVisible();
			expect( screen.queryByText( /Learn how to fix/i ) ).toBeVisible();
		} );

		test( 'shows user token error message', () => {
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = USER_TOKEN_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = BLOG_TOKEN_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = HTTP_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							error,
							jetpack_connection_problem: true,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = INACTIVITY_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = XMLRPC_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							jetpack_connection_problem: true,
							error,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = REST_API_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							error,
							jetpack_connection_problem: true,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = PLUGIN_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							error,
							jetpack_connection_problem: true,
						},
					},
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
			jest.useFakeTimers().setSystemTime( Date.now() );
			const lastRequestTime = Date.now() - 1000 * 60 * 4;
			const error = GENERIC_ERROR;

			const initialState = {
				jetpackConnectionHealth: {
					1: {
						requestError: null,
						lastRequestTime,
						connectionHealth: {
							error,
							jetpack_connection_problem: true,
						},
					},
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
