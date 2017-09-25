/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import url from 'url';

function logImageLoads() {
	const imagesLoaded = [];
	let originalImage;

	before( function spyOnImage() {
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
			}
		} );
	} );

	after( function tearDownSpy() {
		global.Image = originalImage;
	} );

	return imagesLoaded;
}

describe( 'Analytics', function() {
	useFakeDom();
	useFilesystemMocks( __dirname );
	const imagesLoaded = logImageLoads();

	// can't require this until the fake DOM is present
	let analytics;
	before( () => {
		analytics = require( '../' );
	} );

	beforeEach( function() {
		// this seems really weird. but we need to keep the same array reference, but trim the array
		imagesLoaded.length = 0;
	} );

	describe( 'mc', function() {
		it( 'bumpStat with group and stat', function() {
			analytics.mc.bumpStat( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );

		it( 'bumpStat with value object', function() {
			analytics.mc.bumpStat( {
				go: 'time',
				another: 'one'
			} );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom-no-pv' );
			expect( imagesLoaded[ 0 ].query.x_go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.x_another ).to.eql( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );

		it( 'bumpStatWithPageView with group and stat', function() {
			analytics.mc.bumpStatWithPageView( 'go', 'time' );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );

		it( 'bumpStatWithPageView with value object', function() {
			analytics.mc.bumpStatWithPageView( {
				go: 'time',
				another: 'one'
			} );
			expect( imagesLoaded[ 0 ].query.v ).to.eql( 'wpcom' );
			expect( imagesLoaded[ 0 ].query.go ).to.eql( 'time' );
			expect( imagesLoaded[ 0 ].query.another ).to.eql( 'one' );
			expect( imagesLoaded[ 0 ].query.t ).to.be.ok;
		} );
	} );
} );
