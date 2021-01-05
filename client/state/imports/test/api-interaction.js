/**
 * External dependencies
 */
import nock from 'nock';
import { createStore, combineReducers, applyMiddleware } from 'redux'; // eslint-disable-line no-restricted-imports
import thunk from 'redux-thunk';

/**
 * Internal dependencies
 */
import imports from 'calypso/state/imports/reducer';
import { fetchState, lockImport } from 'calypso/state/imports/actions';
import {
	isImporterStatusHydrated,
	getImporterStatus,
	getImporterStatusForSiteId,
} from 'calypso/state/imports/selectors';
import { appStates } from 'calypso/state/imports/constants';

const createReduxStore = () => {
	return createStore( combineReducers( { imports } ), applyMiddleware( thunk ) );
};

const testSiteId = 'en.blog.wordpress.com';

const queuePayload = ( payload ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.get( `/rest/v1.1/sites/${ testSiteId }/imports/` )
		.replyWithFile( 200, `${ __dirname }/api-payloads/${ payload }.json`, {
			'Content-Type': 'application/json',
		} );

describe( 'Importer store', () => {
	describe( 'API integration', () => {
		test( 'should hydrate if the API returns a blank body', async () => {
			const store = createReduxStore();
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'no-imports' );
			await store.dispatch( fetchState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test( 'should hydrate if the API returns a defunct importer', async () => {
			const store = createReduxStore();
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'defunct-importer' );
			await store.dispatch( fetchState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test( 'should hydrate if the API returns an expired importer', async () => {
			const store = createReduxStore();
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'expired-importer' );
			await store.dispatch( fetchState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test( 'should hydrate if the API returns a running importer', async () => {
			const store = createReduxStore();
			const testImporterId = 'runningImporter';
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'running-importer' );
			await store.dispatch( fetchState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatus( store.getState(), testImporterId )?.importerState ).toBe(
				appStates.IMPORTING
			);
		} );

		test( 'should ignore an update to importer that is locked', async () => {
			const store = createReduxStore();
			const testImporterId = 'runningImporter';
			queuePayload( 'running-importer' );
			store.dispatch( lockImport( testImporterId ) );
			await store.dispatch( fetchState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );
	} );
} );
