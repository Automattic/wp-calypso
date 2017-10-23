/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import url from 'url';

/**
 * Internal dependencies
 */
import analytics from '../';

jest.mock( 'config', () => require( './mocks/config' ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {
	retarget: () => {},
} ) );
jest.mock( 'lib/load-script', () => require( './mocks/lib/load-script' ) );

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
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );

		test( 'bumpStat with value object', () => {
			analytics.mc.bumpStat( {
				go: 'time',
				another: 'one',
			} );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.x_another ).to.eql( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );

		test( 'bumpStatWithPageView with group and stat', () => {
			analytics.mc.bumpStatWithPageView( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );

		test( 'bumpStatWithPageView with value object', () => {
			analytics.mc.bumpStatWithPageView( {
				go: 'time',
				another: 'one',
			} );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.another ).to.eql( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );
	} );
} );
