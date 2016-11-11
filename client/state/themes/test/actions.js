/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import { Map } from 'immutable';

/**
 * Internal dependencies
 */
import {
	THEME_ACTIVATE_REQUEST,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	THEME_ACTIVATE_REQUEST_FAILURE,
} from 'state/action-types';
import {
	themeActivated,
	activateTheme,
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	const trackingData = {
		theme: 'twentysixteen',
		previous_theme: 'twentyfifteen',
		source: 'unknown',
		purchased: false,
		search_term: 'simple, white'
	};

	const expectedActivationSuccess = {
		meta: {
			analytics: [
				{
					payload: {
						name: 'calypso_themeshowcase_theme_activate',
						properties: {
							previous_theme: 'twentyfifteen',
							purchased: false,
							search_term: 'simple, white',
							source: 'unknown',
							theme: 'twentysixteen',
						},
						service: 'tracks',
					},
					type: 'ANALYTICS_EVENT_RECORD'
				},
			],
		},
		type: THEME_ACTIVATE_REQUEST_SUCCESS,
		theme: { id: 'twentysixteen' },
		siteId: 2211667,
	};

	const fakeGetState = () => ( {
		themes: {
			currentTheme: Map( {
				currentThemes: Map().set( 2211667, {
					id: 'twentyfifteen'
				} ) } ),
			themesList: Map( {
				query: Map( {
					search: 'simple, white'
				} )
			} )
		}
	} );

	describe( '#themeActivated()', () => {
		it( 'should return an action object', () => {
			const theme = { id: 'twentysixteen' };
			const siteId = 2211667;

			themeActivated( theme, siteId )( spy, fakeGetState );
			expect( spy ).to.have.been.calledWith( expectedActivationSuccess );
		} );
	} );

	describe( '#activateTheme()', () => {
		const themeId = 'twentysixteen';
		const siteId = 2211667;
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: themeId } )
				.reply( 200, { id: 'karuna', version: '1.0.3' } )
				.post( '/rest/v1.1/sites/2211667/themes/mine', { theme: 'badTheme' } )
				.reply( 404, {
					error: 'theme_not_found',
					message: 'The specified theme was not found'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			activateTheme( themeId, siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_ACTIVATE_REQUEST,
				siteId,
				themeId,
			} );
		} );

		it( 'should dispatch theme activation success thunk when request completes', () => {
			return activateTheme( themeId, siteId, trackingData )( spy ).then( () => {
				expect( spy.secondCall.args[ 0 ].name ).to.equal( 'themeActivatedThunk' );
			} );
		} );

		it( 'should dispatch theme activation failure action when request completes', () => {
			const error = {
				error: sinon.match( { message: 'The specified theme was not found' } ),
				siteId: 2211667,
				themeId: 'badTheme',
				type: THEME_ACTIVATE_REQUEST_FAILURE
			};

			return activateTheme( 'badTheme', siteId, trackingData )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( error );
			} );
		} );
	} );
} );
