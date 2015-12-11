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

	describe( 'withSelectedFirst', function() {
		it( 'should return empty array when given empty array', function() {
			var sitesList = SitesList();
			assert.deepEqual( [], sitesList.withSelectedFirst( [] ) );
		} );
		it( 'should return an equal array if there is no selected element', function() {
			var sitesList = SitesList();
			sitesList.selected = null;
			assert.deepEqual( original, sitesList.withSelectedFirst( original ) );
		} );
		it( 'should keep the first element if it is selected', function() {
			var sitesList = SitesList();
			sitesList.initialize( original.slice() );
			sitesList.selected = original[0].ID;
			assert.deepEqual( original, sitesList.withSelectedFirst( original ) );
		} );
		it( 'should move the selected site to the front', function() {
			var sitesList = SitesList(),
				sites = [ {ID: 1}, {ID: 2}, {ID: 3} ];
			sitesList.initialize( sites.slice() );
			sitesList.selected = 2;
			assert.deepEqual( [ {ID: 2}, {ID: 1}, {ID: 3}], sitesList.withSelectedFirst( sites ) );
		} );
		it( 'should not mutate original array', function() {
			var sitesList = SitesList(),
				sites = [ {ID: 1}, {ID: 2}, {ID: 3} ],
				originalSites = sites.slice(),
				after;
			sitesList.initialize( sites.slice() );
			sitesList.selected = 2;
			sitesList.withSelectedFirst( sites );
			after = assert.deepEqual( originalSites, sites );
			assert( after !== sites );
		} );
	} );

} );
