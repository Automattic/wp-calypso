import { expect } from 'chai';
import Dispatcher from 'dispatcher';
import nock from 'nock';
import partial from 'lodash/function/partial';

import { fetchState } from '../actions';
import { actionTypes } from '../constants';
import {
	noImports,
	defunctImporter
} from './server-payloads';
import store from '../store';

const fetchTestState = partial( fetchState, 0 );
const hydratedState = () => store.get().getIn( [ 'api', 'isHydrated' ] );
const resetStore = () => Dispatcher.handleViewAction( { type: actionTypes.RESET_STORE } );

const queuePayload = payload =>
	nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/sites/0/imports/' )
		.reply( 200, payload );

describe( 'Importer store', () => {
	beforeEach( resetStore );

	describe( 'API integration', () => {
		it( 'should hydrate if the API returns a blank body', done => {
			expect( hydratedState(), 'before fetch' ).to.be.false;

			queuePayload( noImports );
			fetchTestState()
				.then( () => { expect( hydratedState(), 'after fetch' ).to.be.true } )
				.then( done )
				.catch( done );
		} );

		it( 'should hydrate if the API returns a defunct importer', done => {
			expect( hydratedState(), 'before fetch' ).to.be.false;

			queuePayload( defunctImporter );
			fetchTestState()
				.then( () => { expect( hydratedState(), 'after fetch' ).to.be.true } )
				.then( done )
				.catch( done );
		} );
	} );
} );
