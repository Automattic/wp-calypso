/**
 * External dependencies
 */
import nock from 'nock';

/**
 * Internal dependencies
 */
import { fetchState } from '../actions';
import store from '../store';
import Dispatcher from 'calypso/dispatcher';
import { IMPORTS_STORE_RESET, IMPORTS_IMPORT_LOCK } from 'calypso/state/action-types';
import { appStates } from 'calypso/state/imports/constants';

const testSiteId = 'en.blog.wordpress.com';
const hydratedState = () => store.get().api.isHydrated;
const importersState = () => store.get().importers;
const resetStore = () => Dispatcher.handleViewAction( { type: IMPORTS_STORE_RESET } );
const lockImport = ( importerId ) =>
	Dispatcher.handleViewAction( { type: IMPORTS_IMPORT_LOCK, importerId } );

const queuePayload = ( payload ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.get( `/rest/v1.1/sites/${ testSiteId }/imports/` )
		.replyWithFile( 200, `${ __dirname }/api-payloads/${ payload }.json`, {
			'Content-Type': 'application/json',
		} );

describe( 'Importer store', () => {
	beforeEach( resetStore );

	describe( 'API integration', () => {
		test( 'should hydrate if the API returns a blank body', async () => {
			expect( hydratedState() ).toBe( false );
			queuePayload( 'no-imports' );
			await fetchState( testSiteId );
			expect( hydratedState() ).toBe( true );
			expect( importersState() ).toEqual( {} );
		} );

		test( 'should hydrate if the API returns a defunct importer', async () => {
			expect( hydratedState() ).toBe( false );
			queuePayload( 'defunct-importer' );
			await fetchState( testSiteId );
			expect( hydratedState() ).toBe( true );
			expect( importersState() ).toEqual( {} );
		} );

		test( 'should hydrate if the API returns an expired importer', async () => {
			expect( hydratedState() ).toBe( false );
			queuePayload( 'expired-importer' );
			await fetchState( testSiteId );
			expect( hydratedState() ).toBe( true );
			expect( importersState() ).toEqual( {} );
		} );

		test( 'should hydrate if the API returns a running importer', async () => {
			const testImporterId = 'runningImporter';
			expect( hydratedState() ).toBe( false );
			queuePayload( 'running-importer' );
			await fetchState( testSiteId );
			expect( hydratedState() ).toBe( true );
			expect( importersState()[ testImporterId ]?.importerState ).toBe( appStates.IMPORTING );
		} );

		test( 'should ignore an update to importer that is locked', async () => {
			const testImporterId = 'runningImporter';
			queuePayload( 'running-importer' );
			lockImport( testImporterId );
			await fetchState( testSiteId );
			expect( hydratedState() ).toBe( true );
			expect( importersState() ).toEqual( {} );
		} );
	} );
} );
