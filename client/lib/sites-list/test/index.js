/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import { cloneDeep, forEach, noop } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'SitesList', () => {
	let SitesList, Site, data;
	let sitesList, originalData, initializedSites;

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', {
			me: () => ( {
				get: noop
			} )
		} );
	} );
	useFakeDom();

	before( () => {
		Site = require( 'lib/site' );
		SitesList = require( '../list' );
		data = require( './fixtures/data' );
	} );

	beforeEach( () => {
		originalData = cloneDeep( data.original );
		sitesList = SitesList();
		sitesList.initialize( originalData );
		initializedSites = sitesList.get();
	} );

	describe( 'initialization', () => {
		it( 'should create the correct number of sites', () => {
			assert.equal( initializedSites.length, originalData.length );
		} );

		it( 'should create Site objects', () => {
			forEach( initializedSites, site => {
				assert.instanceOf( site, Site );
			} );
		} );

		it( 'should set attributes properly', () => {
			const site = initializedSites[ 0 ];
			const origSite = originalData[ 0 ];

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
		let updatedData, originalList;

		before( () => {
			updatedData = cloneDeep( data.updated );
			originalList = sitesList.initialize( originalData );
		} );

		it( 'updating should not create new Site instances', () => {
			sitesList.update( updatedData );
			const updatedList = sitesList.get();

			forEach( originalList, ( site, index ) => {
				assert.strictEqual( site, updatedList[ index ] );
			} );
		} );

		it( 'updating should reflect removed properties on site', () => {
			const updatedWithIconOmitted = cloneDeep( updatedData ).map( ( site ) => {
				delete site.icon;
				return site;
			} );
			sitesList.update( updatedWithIconOmitted );
			const updatedList = sitesList.get();

			forEach( updatedList, ( site ) => {
				assert.notProperty( site, 'icon' );
			} );
		} );

		it( 'should update attributes properly', () => {
			sitesList.update( updatedData );
			const site = sitesList.get()[ 0 ];
			const updatedSite = updatedData[ 0 ];

			forEach( updatedSite, ( updatedValue, prop ) => {
				assert.deepEqual( updatedValue, site[ prop ] );
			} );
		} );
	} );

	describe( 'change propagation', () => {
		it( 'should trigger change when site is updated', () => {
			const siteId = originalData[ 0 ].ID;
			const changeCallback = sinon.spy();

			sitesList.initialize( cloneDeep( data.original ) );
			sitesList.once( 'change', changeCallback );

			const site = sitesList.getSite( siteId );
			site.set( { description: 'Calypso rocks!' } );
			assert.isTrue( changeCallback.called );
		} );
	} );
} );
