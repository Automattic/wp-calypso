var assert = require( 'assert' );

var Site = require( '../' );

describe( 'Calypso Site', function() {
	describe( 'setting attributes', function() {

		it( 'attribute changed', function() {
			var site = Site( {
				ID: 1234,
				name: 'Hello',
				description: 'Hunting bugs is fun.'
			} );

			site.set( { name: 'Goodbye' } );

			assert( site.name === 'Goodbye' );
		} );

		it( 'change event fires on attribute change', function() {
			var called = false,
				site;

			site = Site( {
				ID: 1234,
				name: 'Hello',
				description: 'Hunting bugs is fun.'
			} );

			site.once( 'change', function() {
				called = true;
			} );

			site.set( { name: 'Goodbye' } );

			assert( called === true );
		} );

		it( "change doesn't fire when setting attribute to same value", function() {
			var called = false,
				site;

			site = Site( {
				ID: 1234,
				name: 'Hello',
				description: 'Hunting bugs is fun.'
			} );

			site.once( 'change', function() {
				called = true;
			} );

			site.set( { name: 'Hello' } );

			assert( called === false );
		} );

		it( "change doesn't fire when attribute is set to an object with identical data", function() {
			var called = false,
				site;

			site = Site( {
				ID: 1234,
				obj: {
					name: 'Hello',
					description: 'Hunting bugs is fun.'
				}
			} );

			site.once( 'change', function() {
				called = true;
			} );

			site.set( { obj: {
					name: 'Hello',
					description: 'Hunting bugs is fun.'
				}
			} );

			assert( called === false );
		} );

		it( "change doesn't fire when attribute is set to an array with identical data", function() {
			var called = false,
				site;

			site = Site( {
				ID: 1234,
				arr: [ 1, 2, 3 ]
			} );

			site.once( 'change', function() {
				called = true;
			} );

			site.set( { arr: [ 1, 2, 3 ] } );

			assert( called === false );
		} );
	} );
} );
