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
	themeActivation,
	themeActivated,
	themeActivationFailed,
	themeActivationSuccess,
	activateTheme,
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#themeActivation()', () => {
		it( 'should return an action object', () => {
			const themeId = 'twentysixteen';
			const siteId = 2211667;
			const expected = {
				type: THEME_ACTIVATE_REQUEST,
				themeId,
				siteId,
			};

			const action = themeActivation( themeId, siteId );
			expect( action ).to.eql( expected );
		} );
	} );

	describe( '#themeActivated()', () => {
		it( 'should return an action object', () => {
			const theme = { id: 'twentysixteen' };
			const siteId = 2211667;
			const expected = {
				type: THEME_ACTIVATE_REQUEST_SUCCESS,
				theme,
				siteId,
			};

			const action = themeActivated( theme, siteId );
			expect( action ).to.eql( expected );
		} );
	} );

	describe( '#themeActivationFailed()', () => {
		it( 'should return an action object', () => {
			const themeId = 'twentysixteen';
			const siteId = 2211667;
			const error = { error: 'theme_not_found', message: 'The specified theme was not found' };
			const expected = {
				type: THEME_ACTIVATE_REQUEST_FAILURE,
				themeId,
				siteId,
				error,
			};

			const action = themeActivationFailed( themeId, siteId, error );
			expect( action ).to.eql( expected );
		} );
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

	const currentThemes = Map().set(
		2211667, {
			id: 'twentyfifteen'
		} );

	const fakeState = {
		themes: {
			currentTheme: Map( { currentThemes } ),
			themesList: Map( {
				query: Map( {
					search: 'simple, white'
				} )
			} )
		}
	};

	const fakeGetState = () => fakeState;

	describe( '#themeActivationSuccess()', () => {
		it( 'should return an action object', () => {
			const theme = { id: 'twentysixteen' };
			const siteId = 2211667;

			themeActivationSuccess( theme, siteId )( spy, fakeGetState );
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
				expect( spy.secondCall.args[ 0 ].name ).to.equal( 'themeActivationSuccessThunk' );
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
