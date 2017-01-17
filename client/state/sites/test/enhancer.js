/* eslint-disable no-restricted-modules */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';
import { SITES_UPDATE, SITE_RECEIVE } from 'state/action-types';
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
	let sitesListFactory, Site, store, sitesList;
	const state = { sites: { items: {} } };

	useFakeDom();

	useSandbox( ( sandbox ) => {
		Site = require( 'lib/site' );
		sitesListFactory = require( 'lib/sites-list' );

		store = sitesSync( () => ( {
			dispatch: sandbox.spy(),
			getState: sandbox.stub().returns( state )
		} ) )();

		sitesList = sitesListFactory();
		sandbox.spy( sitesList, 'sync' );
	} );

	beforeEach( () => {
		state.sites.items = {};
		sitesList.initialize( [] );
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

	it( 'should reflect into state updates to a site', () => {
		state.sites.items[ 2916284 ] = EXAMPLE_SITE;
		const site = new Site( EXAMPLE_SITE );
		site.set( { name: 'WordPress.com Example Blog!' } );

		expect( store.dispatch ).to.have.been.calledWithMatch( {
			type: SITE_RECEIVE,
			site: match( { name: 'WordPress.com Example Blog!' } )
		} );
	} );

	it( 'should not reflect into state updates to a site if not tracked', () => {
		const site = new Site( EXAMPLE_SITE );
		site.set( { name: 'WordPress.com Example Blog!' } );

		expect( store.dispatch ).to.not.have.been.called;
	} );

	it( 'should not reflect into state updates to a site if no changes', () => {
		state.sites.items[ 2916284 ] = EXAMPLE_SITE;
		const site = new Site( EXAMPLE_SITE );
		site.set( { name: 'WordPress.com Example Blog' } );

		expect( store.dispatch ).to.not.have.been.called;
	} );
} );
