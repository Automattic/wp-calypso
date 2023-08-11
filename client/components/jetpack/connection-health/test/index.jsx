/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { merge } from 'lodash';
import { jetpackConnectionHealth } from 'calypso/state/jetpack-connection-health/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { JetpackConnectionHealthBanner } from '..';
import {
	FATAL_ERROR,
	USER_TOKEN_ERROR,
	BLOG_TOKEN_ERROR,
	HTTP_ERROR,
	DNS_ERROR,
	UNKNOWN_ERROR,
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

			expect(
				screen.getByText( /Jetpack is unable to communicate with your site./i )
			).toBeVisible();
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
				screen.getByText(
					/Jetpack is unable to communicate with your site due to a critical error that has occurred there/i
				)
			).toBeVisible();
		} );

		test( 'shows dns error message', () => {
			mockError.mockReturnValue( DNS_ERROR );

			const initialState = {
				jetpackConnectionHealth: {
					1: { jetpack_connection_problem: true },
				},
			};

			render( <JetpackConnectionHealthBanner siteId={ 1 } />, { initialState } );

			expect( screen.getByText( /Jetpack is unable to connect to your domain./i ) ).toBeVisible();
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
				screen.getByText(
					/Jetpack is unable to communicate with your site due to a token error. Please reconnect Jetpack./i
				)
			).toBeVisible();
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
				screen.getByText(
					/Jetpack is unable to communicate with your site due to a token error. Please reconnect Jetpack./i
				)
			).toBeVisible();
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
				screen.getByText(
					/Jetpack is unable to communicate with your site due to a HTTP connection error. Please ensure that your site serves requests./i
				)
			).toBeVisible();
		} );
	} );
} );
