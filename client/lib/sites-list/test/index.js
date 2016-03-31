/**
 * External dependencies
 */
import { assert } from 'chai';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'SitesList', () => {
	let SitesList, Site, data;
	useMockery();
	useFakeDom();

	before( () => {
		Site = require( 'lib/site' );
		SitesList = require( '../list' );
		data = require( './fixtures/data' );
	} );

	describe( 'initialization', () => {
		let sitesList, originalData, initializedSites;

		beforeEach( () => {
			originalData = cloneDeep( data.original );
			sitesList = SitesList();
			sitesList.initialize( originalData );
			initializedSites = sitesList.get();
		} );

		it( 'should create the correct number of sites', () => {
			assert.equal( initializedSites.length, originalData.length );
		} );

		it( 'should create Site objects', () => {
			forEach( initializedSites, site => {
				assert.instanceOf( site, Site )
			} );
		} );

		it( 'should set attributes properly', () => {
			let site = initializedSites[ 0 ];
			let origSite = originalData[ 0 ];

			forEach( origSite, ( value, prop ) => {
				assert.deepEqual( value, site[ prop ] );
			} );
		} );

		it( 'should add change handlers', () => {
			forEach( initializedSites, ( site ) => {
				assert.isDefined( site.listeners( 'change' ) );
			} );
		} );
	} );

	describe( 'updating', () => {
		let sitesList, originalData, updatedData, originalList;

		beforeEach( () => {
			originalData = cloneDeep( data.original );
			updatedData = cloneDeep( data.updated );
			sitesList = SitesList();
			originalList = sitesList.initialize( originalData );
		} );

		it( 'updating should not create new Site instances', () => {
			sitesList.update( updatedData );
			let updatedList = sitesList.get();

			forEach( originalList, ( site, index ) => {
				assert.strictEqual( site, updatedList[ index ] );
			} );
		} );

		it( 'should update attributes properly', () => {
			sitesList.update( updatedData );

			let site = sitesList.get()[ 0 ];
			let updatedSite = updatedData[ 0 ];

			forEach( updatedSite, ( updatedValue, prop ) => {
				assert.deepEqual( updatedValue, site[ prop ] );
			} );
		} );
	} );

	describe( 'change propagation', () => {
		it( 'should trigger change when site is updated', () => {
			let sitesList = SitesList();
			let called = false;
			let originalData = cloneDeep( data.original );
			let siteId = originalData[0].ID;
			let site;

			sitesList.initialize( cloneDeep( data.original ) );
			sitesList.once( 'change', () => {
				called = true;
			} );

			site = sitesList.getSite( siteId );
			site.set( { description: 'Calypso rocks!' } );
			assert.isTrue( called );
		} );
	} );
} );
