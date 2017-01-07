/* eslint-disable no-restricted-modules */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { SITES_UPDATE } from 'state/action-types';
import sitesSync from '../enhancer';

/**
 * Example site used for testing mocked behavior.
 *
 * @type {Object}
 */
const EXAMPLE_SITE = {
	ID: 2916284,
	name: 'WordPress.com Example Blog'
};

describe( 'sitesSync()', () => {
	let sitesListFactory, Site, dispatch, createStore, store, sitesList;

	useFakeDom();

	before( () => {
		Site = require( 'lib/site' );
		sitesListFactory = require( 'lib/sites-list' );

		dispatch = spy();
		createStore = sitesSync( () => ( {
			dispatch
		} ) );
	} );

	beforeEach( () => {
		store = createStore();
		sitesList = sitesListFactory();
		sitesList.initialize( [] );
		spy( sitesList, 'sync' );
	} );

	it( 'should preserve existing sync behavior', () => {
		sitesList.sync( { sites: [ EXAMPLE_SITE ] } );

		expect( sitesList.get() ).to.have.length( 1 );
	} );

	it( 'should cause sites to be updated in state', () => {
		sitesList.sync( { sites: [ EXAMPLE_SITE ] } );

		expect( store.dispatch ).to.have.been.calledWithMatch( {
			type: SITES_UPDATE,
			sites: [ match.instanceOf( Site ) ]
		} );
	} );
} );
