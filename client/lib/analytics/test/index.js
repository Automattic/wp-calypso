/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import url from 'url';

/**
 * Internal dependencies
 */
import analytics from '../';
import { recordAliasInFloodlight } from 'lib/analytics/ad-tracking';

jest.mock( 'config', () => require( './mocks/config' ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {
	retarget: () => {},
	recordAliasInFloodlight: jest.fn(),
} ) );
jest.mock( '@automattic/load-script', () => require( './mocks/lib/load-script' ) );

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
			analytics.mc.bumpStat( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );

		test( 'bumpStat with value object', () => {
			analytics.mc.bumpStat( {
				go: 'time',
				another: 'one',
			} );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.x_another ).toEqual( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );

		test( 'bumpStatWithPageView with group and stat', () => {
			analytics.mc.bumpStatWithPageView( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).toEqual( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).toEqual( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).toBeTruthy();
		} );

		test( 'bumpStatWithPageView with value object', () => {
			analytics.mc.bumpStatWithPageView( {
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
		let userMock;
		beforeEach( () => {
			analytics.tracks.anonymousUserId = jest.fn( () => true );
			userMock = {
				get: jest.fn( () => ( {
					ID: '007',
					username: 'james',
				} ) ),
				initialized: true,
			};
			window._tkq.push = jest.fn();
		} );
		test( 'should not call window._tkq.push or recordAliasInFloodlight when there is no user info', () => {
			analytics.identifyUser();
			expect( window._tkq.push ).not.toBeCalled();
			expect( recordAliasInFloodlight ).not.toBeCalled();
		} );

		test( 'should call window._tkq.push and recordAliasInFloodlight when user object exists', () => {
			analytics.identifyUser( userMock );
			expect( recordAliasInFloodlight ).toBeCalled();
			expect( userMock.get ).toBeCalled();
			expect( window._tkq.push ).toBeCalledWith( [ 'identifyUser', '007', 'james' ] );
		} );
	} );
} );
