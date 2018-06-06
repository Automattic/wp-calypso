/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	cancelImport,
	failUpload,
	fetchState,
	finishUpload,
	mapAuthor,
	startMappingAuthors,
	resetImport,
	setUploadProgress,
	startImport,
	startImporting,
	startUpload,
} from '../actions';
import {
	IMPORTS_FETCH,
	IMPORTS_FETCH_FAILED,
	IMPORTS_FETCH_COMPLETED,
	IMPORTS_IMPORT_START,
	IMPORTS_START_IMPORTING,
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RESET,
	IMPORTS_IMPORT_RECEIVE,
	IMPORTS_UPLOAD_START,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_AUTHORS_SET_MAPPING,
	IMPORTS_IMPORT_LOCK,
	IMPORTS_IMPORT_UNLOCK,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import { fromApi } from '../utils';

const makeApiResponse = ( siteId, importerId, status ) => ( {
	siteId,
	importId: importerId,
	type: 'wordpress',
	importStatus: status,
	customData: {
		sourceAuthors: [],
	},
} );

describe( 'actions', () => {
	const siteId = 123;
	const invalidSiteId = 999;
	const importerId = 'testId';
	const invalidImporterId = 'unknownId';

	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	describe( '#cancelImport', () => {
		const apiResponse = makeApiResponse( siteId, importerId, 'uploadSuccess' );

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/imports/${ importerId }` )
				.reply( 200, apiResponse )
				.post( `/rest/v1.1/sites/${ siteId }/imports/${ invalidImporterId }` )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( `dispatches an ${ IMPORTS_IMPORT_LOCK } action when triggered`, () => {
			cancelImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_LOCK,
				importerId,
			} );
		} );

		test( `dispatches an ${ IMPORTS_IMPORT_CANCEL } action when triggered`, () => {
			cancelImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_CANCEL,
				importerId,
				siteId,
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH } action when triggered`, () => {
			cancelImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH,
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH_COMPLETED } action when the request completes`, async () => {
			await cancelImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH_COMPLETED,
			} );
		} );

		test( `dispatches an ${ IMPORTS_IMPORT_RECEIVE } action when the request completes`, async () => {
			await cancelImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: fromApi( apiResponse ),
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH_FAILED } action when the request fails`, async () => {
			await cancelImport( siteId, invalidImporterId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH_FAILED,
			} );
		} );

		test( 'does not return a promise when the importerId is prefexed `local-generated-id-`', () => {
			const value = cancelImport( siteId, 'local-generated-id-test' )( spy );

			expect( value ).to.be.undefined;
		} );

		test( `does not dispatch ${ IMPORTS_FETCH } when the importerId is prefexed \`local-generated-id-\``, () => {
			cancelImport( siteId, 'local-generated-id-test' )( spy );

			expect( spy ).not.to.have.been.calledWith( {
				type: IMPORTS_FETCH,
			} );
		} );
	} );

	describe( '#failUpload', () => {
		test( `returns an ${ IMPORTS_UPLOAD_FAILED } action`, () => {
			const errorObject = {
				message: 'test error',
			};

			const action = failUpload( importerId )( errorObject );

			expect( action ).to.eql( {
				type: IMPORTS_UPLOAD_FAILED,
				importerId,
				error: errorObject.message,
			} );
		} );
	} );

	describe( '#fetchState', () => {
		const apiResponse = makeApiResponse( siteId, importerId, 'uploadSuccess' );

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/imports/` )
				.reply( 200, apiResponse )
				.get( `/rest/v1.1/sites/${ invalidSiteId }/imports/` )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH } action when triggered`, () => {
			fetchState( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH,
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH_COMPLETED } action when the request completes`, async () => {
			await fetchState( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH_COMPLETED,
			} );
		} );

		test( `dispatches a ${ IMPORTS_IMPORT_RECEIVE } action for the importer in the payload`, async () => {
			await fetchState( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: fromApi( apiResponse ),
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH_FAILED } action when the request fails`, async () => {
			await fetchState( invalidSiteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH_FAILED,
			} );
		} );
	} );

	describe( '#finishUpload', () => {
		test( `returns an ${ IMPORTS_UPLOAD_COMPLETED } action`, () => {
			const importerStatus = {
				importerId,
				importerStatus: 'test status',
			};

			const action = finishUpload( importerId )( importerStatus );

			expect( action ).to.eql( {
				type: IMPORTS_UPLOAD_COMPLETED,
				importerId,
				importerStatus,
			} );
		} );
	} );

	describe( '#mapAuthor', () => {
		test( `returns an ${ IMPORTS_AUTHORS_SET_MAPPING } action`, () => {
			const sourceAuthor = 'test source author';
			const targetAuthor = 'test target author';

			const action = mapAuthor( importerId, sourceAuthor, targetAuthor );

			expect( action ).to.eql( {
				type: IMPORTS_AUTHORS_SET_MAPPING,
				importerId,
				sourceAuthor,
				targetAuthor,
			} );
		} );
	} );

	describe( '#startMappingAuthors', () => {
		test( `dispatches an ${ IMPORTS_IMPORT_LOCK } action`, () => {
			startMappingAuthors( importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_LOCK,
				importerId,
			} );
		} );

		test( `dispatches an ${ IMPORTS_AUTHORS_START_MAPPING } action`, () => {
			startMappingAuthors( importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_AUTHORS_START_MAPPING,
				importerId,
			} );
		} );
	} );

	describe( '#resetImport', () => {
		const apiResponse = makeApiResponse( siteId, importerId, 'expire' );

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/imports/${ importerId }` )
				.reply( 200, apiResponse )
				.post( `/rest/v1.1/sites/${ siteId }/imports/${ invalidImporterId }` )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( `dispatches an ${ IMPORTS_IMPORT_LOCK } action`, () => {
			resetImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_LOCK,
				importerId,
			} );
		} );

		test( `dispatches an ${ IMPORTS_IMPORT_RESET } action`, () => {
			resetImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_RESET,
				importerId,
				siteId,
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH } action when triggered`, () => {
			resetImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH,
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH_COMPLETED } action when the request completes`, async () => {
			await resetImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH_COMPLETED,
			} );
		} );

		test( `dispatches a ${ IMPORTS_IMPORT_RECEIVE } action for the importer in the payload`, async () => {
			await resetImport( siteId, importerId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: fromApi( apiResponse ),
			} );
		} );

		test( `dispatches an ${ IMPORTS_FETCH_FAILED } action when the request fails`, async () => {
			await resetImport( siteId, invalidImporterId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_FETCH_FAILED,
			} );
		} );
	} );

	describe( '#setUploadProgress', () => {
		test( `returns a ${ IMPORTS_UPLOAD_SET_PROGRESS } action`, () => {
			const uploadLoaded = 1;
			const uploadTotal = 4;
			const action = setUploadProgress( importerId, {
				uploadLoaded,
				uploadTotal,
			} );

			expect( action ).to.eql( {
				type: IMPORTS_UPLOAD_SET_PROGRESS,
				uploadLoaded,
				uploadTotal,
				importerId,
			} );
		} );
	} );

	describe( '#startImport', () => {
		test( 'returns an action containing a generated Importer Id with the prefix `local-generated-id-`', () => {
			const importerType = 'test';
			const action = startImport( siteId, importerType );

			expect( action.importerId ).to.match( /local-generated-id-\d{1,5}/ );
		} );

		test( 'returns a ${ IMPORTS_IMPORT_START } action', () => {
			const importerType = 'test';
			const action = startImport( siteId, importerType );

			expect( action ).to.contain( {
				type: IMPORTS_IMPORT_START,
				importerType,
				siteId,
			} );
		} );
	} );

	describe( '#startImporting', () => {
		const apiResponse = makeApiResponse( siteId, importerId, 'importing' );
		const importerStatus = fromApi( apiResponse );

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/imports/${ importerId }` )
				.reply( 200, apiResponse );
		} );

		test( `dispatches an ${ IMPORTS_IMPORT_UNLOCK } action`, () => {
			startImporting( importerStatus )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_IMPORT_UNLOCK,
				importerId,
			} );
		} );

		test( `dispatches an ${ IMPORTS_START_IMPORTING } action`, () => {
			startImporting( importerStatus )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_START_IMPORTING,
				importerId,
			} );
		} );

		test( 'returns a promise', () => {
			const returnValue = startImporting( importerStatus )( spy );

			expect( returnValue ).to.have.property( 'then' );
			expect( returnValue ).to.have.property( 'catch' );
		} );
	} );

	describe( '#startUpload', () => {
		const apiResponse = makeApiResponse( siteId, importerId, 'uploadSuccess' );
		const file = {
			name: 'testfile.xml',
		};
		const importerStatus = fromApi( apiResponse );

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/imports/new` )
				.reply( 200, apiResponse );
		} );

		test( `dispatches a ${ IMPORTS_UPLOAD_START } action`, () => {
			startUpload( importerStatus, file )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: IMPORTS_UPLOAD_START,
				filename: file.name,
				importerId,
			} );
		} );
	} );
} );
