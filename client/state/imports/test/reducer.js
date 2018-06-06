/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
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
import { appStates } from 'state/imports/constants';

describe( 'reducer', () => {
	describe( IMPORTS_FETCH, () => {
		test( 'sets the `api.isFetching` property to `true` ', () => {
			const previousState = {
				api: {
					isFetching: false,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_FETCH,
			} );

			expect( state.api.isFetching ).to.be.true;
		} );
	} );

	describe( IMPORTS_FETCH_FAILED, () => {
		test( 'sets the `api.isFetching` property to `false` ', () => {
			const previousState = {
				api: {
					isFetching: true,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_FETCH_FAILED,
			} );

			expect( state.api.isFetching ).to.be.false;
		} );

		test( 'increments the `api.retryCount` by 1', () => {
			const previousState = {
				api: {
					retryCount: 0,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_FETCH_FAILED,
			} );

			expect( state.api.retryCount ).to.equal( 1 );
		} );
	} );

	describe( IMPORTS_FETCH_COMPLETED, () => {
		test( 'sets the `api.isFetching` property to `false` ', () => {
			const previousState = {
				api: {
					isFetching: true,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_FETCH_COMPLETED,
			} );

			expect( state.api.isFetching ).to.be.false;
		} );

		test( 'sets the `api.retryCount` to 0', () => {
			const previousState = {
				api: {
					retryCount: 1,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_FETCH_COMPLETED,
			} );

			expect( state.api.retryCount ).to.equal( 0 );
		} );

		test( 'sets the `api.isHydrated` to true', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_FETCH_COMPLETED,
			} );

			expect( state.api.isHydrated ).to.be.true;
		} );
	} );

	describe( IMPORTS_IMPORT_START, () => {
		test( 'increments the `count` property by 1', () => {
			const previousState = {
				count: 0,
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_START,
			} );

			expect( state.count ).to.equal( 1 );
		} );

		test( 'adds a new importer to the list of importers and sets it to the `READY_FOR_UPLOAD` state', () => {
			const previousState = {
				importers: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_START,
				importerId: 'testImporterId',
				importerType: 'testImporterType',
				siteId: 'testSiteId',
			} );

			expect( state.importers ).to.eql( {
				testImporterId: {
					importerId: 'testImporterId',
					type: 'testImporterType',
					importerState: appStates.READY_FOR_UPLOAD,
					site: {
						ID: 'testSiteId',
					},
				},
			} );
		} );
	} );

	describe( IMPORTS_START_IMPORTING, () => {
		test( 'sets the importer with the given id to the `IMPORTING` state', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_START_IMPORTING,
				importerId: 'testImporter',
			} );

			expect( state.importers ).to.eql( {
				testImporter: {
					importerId: 'testImporter',
					importerState: appStates.IMPORTING,
				},
			} );
		} );
	} );

	describe( IMPORTS_IMPORT_CANCEL, () => {
		test( 'removes the importer with the given id from the list of importers', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_CANCEL,
				importerId: 'testImporter',
			} );

			expect( state.importers ).to.eql( {} );
		} );
	} );

	describe( IMPORTS_IMPORT_RESET, () => {
		test( 'removes the importer with the given id from the list of importers', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_CANCEL,
				importerId: 'testImporter',
			} );

			expect( state.importers ).to.eql( {} );
		} );
	} );

	describe( IMPORTS_IMPORT_RECEIVE, () => {
		test( 'sets the `api.isHydrated` property to true', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
				importers: {},
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: {
					importerId: 'testImporter',
				},
			} );

			expect( state.api.isHydrated ).to.be.true;
		} );

		test( 'does not modify the importer if the importer is locked', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
				importerLocks: {
					testImporter: true,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: {
					importerId: 'testImporter',
				},
			} );

			const expectedState = Object.assign( {}, previousState, {
				api: {
					isHydrated: true,
				},
			} );

			expect( state ).to.eql( expectedState );
		} );

		test( 'removes the importer from the list of importers if the provided state is `DEFUNCT`', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: {
					importerId: 'testImporter',
					importerState: appStates.DEFUNCT,
				},
			} );

			expect( state.importers ).to.eql( {} );
		} );

		test( 'removes any other importers that are at the `DEFUNCT` or `CANCEL_PENDING` state', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
					wpImport: {
						importerId: 'wpImport',
						importerState: appStates.CANCEL_PENDING,
					},
					mediumImport: {
						importerId: 'mediumImport',
						importerState: appStates.DEFUNCT,
					},
				},
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: {
					importerId: 'testImporter',
				},
			} );

			expect( state.importers ).to.eql( {
				testImporter: {
					importerId: 'testImporter',
				},
			} );
		} );

		test( 'creates a new importer in the list of importers', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
				importers: {},
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: {
					importerId: 'testImporter',
				},
			} );

			expect( state.importers ).to.eql( {
				testImporter: {
					importerId: 'testImporter',
				},
			} );
		} );

		test( 'overwrites any previous data for the importer', () => {
			const previousState = {
				api: {
					isHydrated: false,
				},
				importers: {
					testImporter: {
						importerId: 'testImporter',
						testProperty: 'will be removed',
					},
				},
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_RECEIVE,
				importerStatus: {
					importerId: 'testImporter',
				},
			} );

			expect( state.importers.testImporter ).to.eql( {
				importerId: 'testImporter',
			} );
		} );
	} );

	describe( IMPORTS_UPLOAD_START, () => {
		test( 'sets the importer with the given id to the `UPLOADING` state', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_START,
				importerId: 'testImporter',
				filename: '',
			} );

			expect( state.importers.testImporter.importerState ).to.equal( appStates.UPLOADING );
		} );

		test( 'sets the filename property for the importer with the given id to the value provided', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.READY_FOR_UPLOAD,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_START,
				importerId: 'testImporter',
				filename: 'adventure.exe',
			} );

			expect( state.importers.testImporter.filename ).to.equal( 'adventure.exe' );
		} );
	} );

	describe( IMPORTS_UPLOAD_FAILED, () => {
		test( 'sets the importer with the given id to the `UPLOAD_FAILURE` state', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.UPLOADING,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_FAILED,
				importerId: 'testImporter',
				error: '',
			} );

			expect( state.importers.testImporter.importerState ).to.equal( appStates.UPLOAD_FAILURE );
		} );

		test( 'sets the `errorData` property for the importer with the given id to error description provided', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.UPLOADING,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_FAILED,
				importerId: 'testImporter',
				error: 'a test error message',
			} );

			expect( state.importers.testImporter.errorData ).to.eql( {
				type: 'uploadError',
				description: 'a test error message',
			} );
		} );
	} );

	describe( IMPORTS_UPLOAD_SET_PROGRESS, () => {
		test( 'sets the `percentComplete` property to a calculated percentage based on the `uploadLoaded` and `uploadTotal` values', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						percentComplete: null,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_SET_PROGRESS,
				importerId: 'testImporter',
				uploadLoaded: 1,
				uploadTotal: 4,
			} );

			expect( state.importers.testImporter.percentComplete ).to.equal( 25 );
		} );

		test( 'sets the `percentComplete` property to `0` when the `uploadTotal` value is also `0`', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						percentComplete: null,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_SET_PROGRESS,
				importerId: 'testImporter',
				uploadLoaded: 0,
				uploadTotal: 0,
			} );

			expect( state.importers.testImporter.percentComplete ).to.equal( 0 );
		} );
	} );

	describe( IMPORTS_UPLOAD_COMPLETED, () => {
		test( 'removes the importer with the provided `importerId` from the list of importers', () => {
			const previousState = {
				importers: {
					firstImporter: {
						importerId: 'firstImporter',
						percentComplete: null,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_COMPLETED,
				importerId: 'firstImporter',
				importerStatus: {
					importerId: 'secondImporter',
				},
			} );

			expect( state.importers.firstImporter ).to.be.undefined;
		} );

		test( 'adds the importer with the provided `importerStatus.importerId` to the list of importers', () => {
			const previousState = {
				importers: {
					firstImporter: {
						importerId: 'firstImporter',
						percentComplete: null,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_UPLOAD_COMPLETED,
				importerId: 'firstImporter',
				importerStatus: {
					importerId: 'secondImporter',
				},
			} );

			expect( state.importers.secondImporter ).to.eql( {
				importerId: 'secondImporter',
			} );
		} );
	} );

	describe( 'IMPORTS_AUTHORS_START_MAPPING', () => {
		test( 'sets the importer with the given id to the `MAP_AUTHORS` state', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.UPLOADING,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_AUTHORS_START_MAPPING,
				importerId: 'testImporter',
			} );

			expect( state.importers.testImporter.importerState ).to.equal( appStates.MAP_AUTHORS );
		} );
	} );

	describe( IMPORTS_AUTHORS_SET_MAPPING, () => {
		test( 'has no effect if the importer with the provided id has no `customData.sourceAuthors` property ', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.UPLOADING,
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_AUTHORS_SET_MAPPING,
				importerId: 'testImporter',
				sourceAuthor: {},
				targetAuthor: '',
			} );

			expect( state ).to.equal( previousState );
		} );

		test( 'adds a `mappedTo` property to any sourceAuthors matching the provided `sourceAuthor.id` property` ', () => {
			const previousState = {
				importers: {
					testImporter: {
						importerId: 'testImporter',
						importerState: appStates.UPLOADING,
						customData: {
							sourceAuthors: [
								{
									id: 'testAuthor',
								},
							],
						},
					},
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_AUTHORS_SET_MAPPING,
				importerId: 'testImporter',
				sourceAuthor: { id: 'testAuthor' },
				targetAuthor: 'mappedAuthor',
			} );

			expect( state.importers.testImporter.customData.sourceAuthors[ 0 ] ).to.eql( {
				id: 'testAuthor',
				mappedTo: 'mappedAuthor',
			} );
		} );
	} );

	describe( IMPORTS_IMPORT_LOCK, () => {
		test( 'adds the value of the provided `importerId` as a key to the `importerLocks` object with the value of `true`', () => {
			const previousState = {
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_LOCK,
				importerId: 'testImporter',
			} );

			expect( state.importerLocks ).to.eql( {
				testImporter: true,
			} );
		} );

		test( 'overwrites any existing values for the provided `importerId` in the `importerLocks` object', () => {
			const previousState = {
				importerLocks: {
					testImporter: false,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_LOCK,
				importerId: 'testImporter',
			} );

			expect( state.importerLocks ).to.eql( {
				testImporter: true,
			} );
		} );
	} );

	describe( IMPORTS_IMPORT_UNLOCK, () => {
		test( 'adds the value of the provided `importerId` as a key to the `importerLocks` object with the value of `false`', () => {
			const previousState = {
				importerLocks: {},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_UNLOCK,
				importerId: 'testImporter',
			} );

			expect( state.importerLocks ).to.eql( {
				testImporter: false,
			} );
		} );

		test( 'overwrites any existing values for the provided `importerId` in the `importerLocks` object', () => {
			const previousState = {
				importerLocks: {
					testImporter: true,
				},
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_UNLOCK,
				importerId: 'testImporter',
			} );

			expect( state.importerLocks ).to.eql( {
				testImporter: false,
			} );
		} );
	} );
} );
