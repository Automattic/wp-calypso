/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/user', () => () => {} );

/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import { cloneDeep, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { original, updated } from './fixtures/data';
import Site from 'lib/site';
import SitesList from '../list';

describe( 'SitesList', () => {
	let sitesList, originalData, initializedSites;

	beforeEach( () => {
		originalData = cloneDeep( original );
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
			updatedData = cloneDeep( updated );
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

			sitesList.initialize( cloneDeep( original ) );
			sitesList.once( 'change', changeCallback );

			const site = sitesList.getSite( siteId );
			site.set( { description: 'Calypso rocks!' } );
			assert.isTrue( changeCallback.called );
		} );
	} );
} );
