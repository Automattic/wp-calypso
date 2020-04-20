/**
 * External dependencies
 */
import { expect } from 'chai';
import { get, partial } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchState } from '../actions';
import store from '../store';
import Dispatcher from 'dispatcher';
import { IMPORTS_STORE_RESET } from 'state/action-types';
import { nock, useNock } from 'test/helpers/use-nock';

const testSiteId = 'en.blog.wordpress.com';
const fetchTestState = partial( fetchState, testSiteId );
const hydratedState = () => get( store.get(), [ 'api', 'isHydrated' ] );
const resetStore = () => Dispatcher.handleViewAction( { type: IMPORTS_STORE_RESET } );

const queuePayload = ( payload ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.get( `/rest/v1.1/sites/${ testSiteId }/imports/` )
		.replyWithFile( 200, `${ __dirname }/api-payloads/${ payload }.json` );

describe( 'Importer store', () => {
	useNock();

	beforeEach( resetStore );

	describe( 'API integration', () => {
		test( 'should hydrate if the API returns a blank body', ( done ) => {
			expect( hydratedState(), 'before fetch' ).to.be.false;

			queuePayload( 'no-imports' );
			fetchTestState()
				.then( () => {
					expect( hydratedState(), 'after fetch' ).to.be.true;
				} )
				.then( done )
				.catch( done );
		} );

		test( 'should hydrate if the API returns a defunct importer', ( done ) => {
			expect( hydratedState(), 'before fetch' ).to.be.false;

			queuePayload( 'defunct-importer' );
			fetchTestState()
				.then( () => {
					expect( hydratedState(), 'after fetch' ).to.be.true;
				} )
				.then( done )
				.catch( done );
		} );
	} );
} );
