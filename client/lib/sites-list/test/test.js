global.localStorage = require( 'localStorage' );

var assert = require( 'assert' );

var SitesList = require( 'lib/sites-list/list' ),
	Site = require( 'lib/site' ),
	data = require( './data' ),
	original = data.original,
	updated = data.updated;

describe( 'SitesList', function() {
	describe( 'initialization', function() {
		it( 'should create Site objects', function() {
			var sitesList = SitesList();

			sitesList.initialize( original.slice() );

			assert( sitesList.get().length === original.length );

			sitesList.get().forEach( function( site ) {
				assert( site instanceof Site );
			} );

		} );

		it( 'should set attributes properly', function() {
			var sitesList = SitesList(),
				site, origSite;
			sitesList.initialize( original.slice() );

			site = sitesList.get()[0];
			origSite = original[0];

			for ( var prop in origSite ) {
				assert( site[ prop ] ===  origSite[ prop ] );

			}
		} );

		it( 'should add change handlers', function() {
			var sitesList = SitesList();

			sitesList.initialize( original.slice() );
			assert( sitesList.get().length, original.length );
			sitesList.get().forEach( function( site ) {
				assert( site.listeners( 'change' ) );
			} );

		} );
	} );

	describe( 'updating', function() {
		it( 'updating should not create new Site instances', function() {
			var sitesList = SitesList(),
				originalList, updatedList;

			sitesList.initialize( original.slice() );

			originalList = sitesList.get();
			sitesList.update( updated.slice() );
			updatedList = sitesList.get();

			originalList.forEach( function( site, index ) {
				assert( site === updatedList[index ] );
			} );
		} );

		it( 'should update attributes properly', function() {
			var sitesList = SitesList(),
				site, updatedSite;
			sitesList.initialize( original.slice() );

			sitesList.update( updated.slice() );

			site = sitesList.get()[0];
			updatedSite = updated[0];

			for ( var prop in updatedSite ) {
				assert( site[ prop ] ===  updatedSite[ prop ] );

			}
		} );


	} );

	describe( 'change propagation', function() {
		it( 'should trigger change when site is updated', function() {
			var sitesList = SitesList(),
				site, called = false;

			sitesList.initialize( original.slice() );
			sitesList.once( 'change', function() {
				called = true;
			} );

			site = sitesList.getSite( 77203074 );
			site.set( { 'description': 'Calypso rocks!' } );
			assert( called );

		} );
	} );

} );
