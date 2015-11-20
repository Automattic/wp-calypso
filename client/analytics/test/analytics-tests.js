var expect = require( 'chai' ).expect,
	url = require( 'url' );

require( 'lib/react-test-env-setup' )();

var imagesLoaded = [];
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

var analytics = require( '../' );

describe( 'Analytics', function() {

	beforeEach( function() {
		imagesLoaded = [];
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
