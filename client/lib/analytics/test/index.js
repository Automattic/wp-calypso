/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import url from 'url';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { bumpStat, bumpStatWithPageView } from 'lib/analytics/mc';
import { recordAliasInFloodlight } from 'lib/analytics/ad-tracking';

jest.mock( 'config', () => require( './mocks/config' ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {
	retarget: () => {},
	recordAliasInFloodlight: jest.fn(),
} ) );
import { loadScript } from '@automattic/load-script';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( () => Promise.reject() ),
} ) );

jest.mock( 'cookie', () => ( {
	parse: jest.fn(),
	serialize: jest.fn(),
} ) );

function logImageLoads() {
	const imagesLoaded = [];
	let originalImage;

	beforeAll( function spyOnImage() {
		imagesLoaded.length = 0;
		originalImage = global.Image;

		global.Image = function() {
			this._src = '';
		};

		Object.defineProperty( global.Image.prototype, 'src', {
			get: function() {
				return this._src;
			},
			set: function( value ) {
				this._src = value;
				imagesLoaded.push( url.parse( value, true, true ) );
			},
		} );
	} );

	afterAll( function tearDownSpy() {
		global.Image = originalImage;
	} );

	return imagesLoaded;
}

describe( 'Analytics', () => {
	const imagesLoaded = logImageLoads();

	beforeEach( () => {
		// this seems really weird. but we need to keep the same array reference, but trim the array
		imagesLoaded.length = 0;
	} );

	describe( 'mc', () => {
		test( 'bumpStat with group and stat', () => {
			bumpStat( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );

		test( 'bumpStat with value object', () => {
			bumpStat( {
				go: 'time',
				another: 'one',
			} );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.x_another ).toEqual( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );

		test( 'bumpStatWithPageView with group and stat', () => {
			bumpStatWithPageView( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );

		test( 'bumpStatWithPageView with value object', () => {
			bumpStatWithPageView( {
				go: 'time',
				another: 'one',
			} );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.another ).toEqual( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );
	} );

	describe( 'identifyUser', () => {
		beforeEach( () => {
			window._tkq = {
				push: jest.fn(),
			};
			cookie.parse.mockImplementation( () => ( { tk_ai: true } ) );
		} );

		afterEach( () => {
			recordAliasInFloodlight.mockReset();
		} );

		test( 'should not call window._tkq.push or recordAliasInFloodlight when there is no user data', () => {
			analytics.identifyUser( {} );
			expect( window._tkq.push ).not.toHaveBeenCalled();
			expect( recordAliasInFloodlight ).not.toHaveBeenCalled();
		} );

		test( 'should not call window._tkq.push and recordAliasInFloodlight when user ID is missing', () => {
			analytics.identifyUser( { ID: undefined, username: 'eight', email: 'eight@example.com' } );
			expect( window._tkq.push ).not.toHaveBeenCalled();
			expect( recordAliasInFloodlight ).not.toHaveBeenCalled();
		} );

		test( 'should not call window._tkq.push and recordAliasInFloodlight when username is missing', () => {
			analytics.identifyUser( { ID: 8, username: undefined, email: 'eight@example.com' } );
			expect( window._tkq.push ).not.toHaveBeenCalled();
			expect( recordAliasInFloodlight ).not.toHaveBeenCalled();
		} );

		test( 'should not call window._tkq.push and recordAliasInFloodlight when email is missing', () => {
			analytics.identifyUser( { ID: 8, username: 'eight', email: undefined } );
			expect( window._tkq.push ).not.toHaveBeenCalled();
			expect( recordAliasInFloodlight ).not.toHaveBeenCalled();
		} );

		test( 'should call window._tkq.push and recordAliasInFloodlight when user ID, username, and email are given', () => {
			analytics.identifyUser( { ID: '8', username: 'eight', email: 'eight@example.com' } );
			expect( recordAliasInFloodlight ).toHaveBeenCalled();
			expect( window._tkq.push ).toHaveBeenCalledWith( [ 'identifyUser', 8, 'eight' ] );
		} );

		test( 'should not call recordAliasInFloodlight when anonymousUserId does not exist', () => {
			cookie.parse.mockImplementationOnce( () => ( {} ) );
			analytics.identifyUser( { ID: 8, username: 'eight', email: 'eight@example.com' } );
			expect( recordAliasInFloodlight ).not.toHaveBeenCalled();
			expect( window._tkq.push ).toHaveBeenCalledWith( [ 'identifyUser', 8, 'eight' ] );
		} );
	} );
	describe( 'initialize', () => {
		beforeEach( () => {
			loadScript.mockReset();

			cookie.parse.mockImplementation( () => ( {} ) );
			cookie.serialize.mockImplementation( () => {} );
		} );
		test( 'if stat.js load fails, should load nostat.js', () => {
			return analytics.initialize().then( () => {
				expect( loadScript ).toHaveBeenCalledWith( expect.stringMatching( /\/nostats.js/ ) );
			} );
		} );
	} );
	describe( 'tracks', () => {
		describe( 'recordEvent', () => {
			beforeEach( () => {
				window._tkq = {
					push: jest.fn(),
				};
				cookie.parse.mockImplementation( () => ( { tk_ai: true } ) );
				global.console.error = jest.fn();
			} );

			test( 'should log error if event name does not match regex', () => {
				analytics.tracks.recordEvent( 'calypso_!!!' );
				expect( global.console.error ).toHaveBeenCalledWith( expect.any( String ), 'calypso_!!!' );
			} );

			test( 'should log error if nested property', () => {
				analytics.tracks.recordEvent( 'calypso_abc_def', {
					nested: {},
				} );
				expect( global.console.error ).not.toHaveBeenCalledWith(
					expect.any( String ),
					'calypso_abc_def'
				);
				expect( global.console.error ).toHaveBeenCalledWith( expect.any( String ), { nested: {} } );
			} );

			test( 'should log error if property names do not match regex', () => {
				analytics.tracks.recordEvent( 'calypso_abc_def', {
					'incorrect!': 'property',
				} );
				expect( global.console.error ).toHaveBeenCalledWith(
					expect.any( String ),
					expect.any( String ),
					'incorrect!'
				);
			} );

			test( 'should log error if using a special reserved property name', () => {
				analytics.tracks.recordEvent( 'calypso_abc_def', {
					geo: 'property',
				} );
				expect( global.console.error ).toHaveBeenCalledWith(
					expect.any( String ),
					'geo',
					expect.any( String )
				);
			} );

			test( 'should add _superProps if they are initialized', () => {
				analytics.initialize( {}, () => {
					return { super: 'prop' };
				} );
				analytics.tracks.recordEvent( 'calypso_abc_def' );

				expect( window._tkq.push ).toHaveBeenCalledWith( [
					'recordEvent',
					'calypso_abc_def',
					{ super: 'prop' },
				] );
			} );

			test( 'should notify listeners when event is recorded', () => {
				let numCalled = 0;
				analytics.addListener( 'record-event', () => {
					numCalled++;
				} );
				analytics.tracks.recordEvent( 'calypso_abc_def' );
				expect( numCalled ).toEqual( 1 );
			} );
		} );
	} );
} );
