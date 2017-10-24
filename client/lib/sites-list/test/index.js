/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { cloneDeep, forEach } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import SitesList from '../list';
import { original, updated } from './fixtures/data';
import Site from 'lib/site';

jest.mock( 'lib/user', () => () => {} );

describe( 'SitesList', () => {
	let sitesList, originalData, initializedSites;

	beforeEach( () => {
		originalData = cloneDeep( original );
		sitesList = SitesList();
		sitesList.initialize( originalData );
		initializedSites = sitesList.get();
	} );

	describe( 'initialization', () => {
		test( 'should create the correct number of sites', () => {
			expect( initializedSites.length ).toEqual( originalData.length );
		} );

		test( 'should create Site objects', () => {
			forEach( initializedSites, site => {
				expect( site ).toBeInstanceOf( Site );
			} );
		} );

		test( 'should set attributes properly', () => {
			const site = initializedSites[ 0 ];
			const origSite = originalData[ 0 ];

			forEach( origSite, ( value, prop ) => {
				expect( value ).toEqual( site[ prop ] );
			} );
		} );

		test( 'should add change handlers', () => {
			forEach( initializedSites, site => {
				expect( site.listeners( 'change' ) ).toBeDefined();
			} );
		} );
	} );

	describe( 'updating', () => {
		let updatedData, originalList;

		beforeAll( () => {
			updatedData = cloneDeep( updated );
			originalList = sitesList.initialize( originalData );
		} );

		test( 'updating should not create new Site instances', () => {
			sitesList.update( updatedData );
			const updatedList = sitesList.get();

			forEach( originalList, ( site, index ) => {
				expect( site ).toBe( updatedList[ index ] );
			} );
		} );

		test( 'updating should reflect removed properties on site', () => {
			const updatedWithIconOmitted = cloneDeep( updatedData ).map( site => {
				delete site.icon;
				return site;
			} );
			sitesList.update( updatedWithIconOmitted );
			const updatedList = sitesList.get();

			forEach( updatedList, site => {
				expect( 'icon' in site ).toBeFalsy();
			} );
		} );

		test( 'should update attributes properly', () => {
			sitesList.update( updatedData );
			const site = sitesList.get()[ 0 ];
			const updatedSite = updatedData[ 0 ];

			forEach( updatedSite, ( updatedValue, prop ) => {
				expect( updatedValue ).toEqual( site[ prop ] );
			} );
		} );
	} );

	describe( 'change propagation', () => {
		test( 'should trigger change when site is updated', () => {
			const siteId = originalData[ 0 ].ID;
			const changeCallback = sinon.spy();

			sitesList.initialize( cloneDeep( original ) );
			sitesList.once( 'change', changeCallback );

			const site = sitesList.getSite( siteId );
			site.set( { description: 'Calypso rocks!' } );
			expect( changeCallback.called ).toBe( true );
		} );
	} );
} );
