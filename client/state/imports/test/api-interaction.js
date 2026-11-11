import nock from 'nock';
import { createStore, combineReducers, applyMiddleware } from 'redux'; // eslint-disable-line no-restricted-imports
import { thunk } from 'redux-thunk';
import {
	fetchImporterState,
	finishUpload,
	lockImport,
	startImport,
} from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import imports from 'calypso/state/imports/reducer';
import {
	isImporterStatusHydrated,
	getImporterStatus,
	getImporterStatusForSiteId,
} from 'calypso/state/imports/selectors';

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
			await store.dispatch( fetchImporterState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test( 'should hydrate if the API returns a defunct importer', async () => {
			const store = createReduxStore();
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'defunct-importer' );
			await store.dispatch( fetchImporterState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test( 'should hydrate if the API returns an expired importer', async () => {
			const store = createReduxStore();
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'expired-importer' );
			await store.dispatch( fetchImporterState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test( 'should hydrate if the API returns a running importer', async () => {
			const store = createReduxStore();
			const testImporterId = 'runningImporter';
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( false );
			queuePayload( 'running-importer' );
			await store.dispatch( fetchImporterState( testSiteId ) );
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
			await store.dispatch( fetchImporterState( testSiteId ) );
			expect( isImporterStatusHydrated( store.getState() ) ).toBe( true );
			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [] );
		} );

		test.each( [ 'cancel', 'importStopped', 'importExpired' ] )(
			'preserves a fresh local upload across repeated polls of an old %s import',
			async ( importStatus ) => {
				const store = createReduxStore();
				queuePayload( 'running-importer' );
				await store.dispatch( fetchImporterState( testSiteId ) );
				const startAction = startImport( 0, 'importer-type-wordpress' );
				store.dispatch( startAction );
				const localImport = getImporterStatus( store.getState(), startAction.importerId );
				nock( 'https://public-api.wordpress.com:443' )
					.get( `/rest/v1.1/sites/${ testSiteId }/imports/` )
					.times( 2 )
					.reply( 200, { importId: 'old-import', importStatus, siteId: 0, type: 'wordpress' } );

				await store.dispatch( fetchImporterState( testSiteId ) );
				await store.dispatch( fetchImporterState( testSiteId ) );

				expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [ localImport ] );
			}
		);

		test( 'replaces stale same-site sessions when the server reports an active import', async () => {
			const store = createReduxStore();
			queuePayload( 'running-importer' );
			await store.dispatch( fetchImporterState( testSiteId ) );
			store.dispatch( startImport( 0, 'importer-type-wordpress' ) );
			const otherSiteImport = startImport( 1, 'importer-type-wordpress' );
			store.dispatch( otherSiteImport );
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.1/sites/${ testSiteId }/imports/` )
				.reply( 200, {
					importId: 'new-server-import',
					importStatus: 'importing',
					siteId: 0,
					type: 'wordpress',
				} );

			await store.dispatch( fetchImporterState( testSiteId ) );

			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [
				expect.objectContaining( {
					importerId: 'new-server-import',
					importerState: appStates.IMPORTING,
				} ),
			] );
			expect( getImporterStatusForSiteId( store.getState(), 1 ) ).toEqual( [
				expect.objectContaining( { importerId: otherSiteImport.importerId } ),
			] );
		} );

		test( 'replaces the temporary session with the server session after upload', () => {
			const store = createReduxStore();
			const startAction = startImport( 0, 'importer-type-wordpress' );
			store.dispatch( startAction );
			const uploadedImport = {
				importerId: 'uploaded-import',
				importerState: appStates.UPLOAD_SUCCESS,
				site: { ID: 0 },
				type: 'importer-type-wordpress',
			};

			store.dispatch( finishUpload( startAction.importerId, uploadedImport ) );

			expect( getImporterStatusForSiteId( store.getState(), 0 ) ).toEqual( [ uploadedImport ] );
		} );
	} );
} );
