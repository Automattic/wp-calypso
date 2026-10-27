/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { appStates } from 'calypso/state/imports/constants';
import { SectionImport } from '../section-import';

const renderSectionImport = ( siteImports ) => {
	const props = {
		canImport: false,
		cancelImport: jest.fn(),
		fetchImporterState: jest.fn(),
		recordTracksEvent: jest.fn(),
		siteId: 1,
		siteImports,
		translate: ( text ) => text,
	};
	const { rerender } = render( <SectionImport { ...props } /> );

	return {
		recordTracksEvent: props.recordTracksEvent,
		update: ( nextSiteImports ) =>
			rerender( <SectionImport { ...props } siteImports={ nextSiteImports } /> ),
	};
};

const uploadFailure = ( errorData ) => ( {
	importerId: 'wordpress-1',
	type: 'importer-type-wordpress',
	importerState: appStates.UPLOAD_FAILURE,
	errorData,
} );

describe( 'SectionImport', () => {
	describe( 'importer state events', () => {
		test( 'does not record the same state again on repeated updates', () => {
			const importFailure = {
				importerId: 'wordpress-1',
				type: 'importer-type-wordpress',
				importerState: appStates.IMPORT_FAILURE,
			};
			const { recordTracksEvent, update } = renderSectionImport( [] );

			update( [ importFailure ] );
			update( [ { ...importFailure } ] );
			update( [ { ...importFailure } ] );

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_importer_import_fail', {
				importer_id: 'importer-type-wordpress',
			} );
		} );

		test( 'records again when the state changes', () => {
			const { recordTracksEvent, update } = renderSectionImport( [] );

			const wordpress = { importerId: 'wordpress-1', type: 'importer-type-wordpress' };

			update( [ { ...wordpress, importerState: appStates.IMPORTING } ] );
			update( [ { ...wordpress, importerState: appStates.IMPORT_FAILURE } ] );

			expect( recordTracksEvent.mock.calls.map( ( [ name ] ) => name ) ).toEqual( [
				'calypso_importer_import_start',
				'calypso_importer_import_fail',
			] );
		} );

		test( 'records again when the error code or type changes for the same state', () => {
			const { recordTracksEvent, update } = renderSectionImport( [] );

			update( [ uploadFailure( {} ) ] );
			update( [ uploadFailure( { code: 'file_too_large' } ) ] );
			update( [ uploadFailure( { code: 'file_too_large' } ) ] );
			update( [ uploadFailure( { code: 'file_too_large', type: 'uploadError' } ) ] );

			expect( recordTracksEvent.mock.calls ).toEqual( [
				[
					'calypso_importer_upload_fail',
					{
						importer_id: 'importer-type-wordpress',
						error_code: undefined,
						error_type: undefined,
						filesize_range: null,
					},
				],
				[
					'calypso_importer_upload_fail',
					{
						importer_id: 'importer-type-wordpress',
						error_code: 'file_too_large',
						error_type: undefined,
						filesize_range: null,
					},
				],
				[
					'calypso_importer_upload_fail',
					{
						importer_id: 'importer-type-wordpress',
						error_code: 'file_too_large',
						error_type: 'uploadError',
						filesize_range: null,
					},
				],
			] );
		} );

		test( 'tracks each importer independently', () => {
			const wordpress = {
				importerId: 'wordpress-1',
				type: 'importer-type-wordpress',
				importerState: appStates.IMPORTING,
			};
			const medium = {
				importerId: 'medium-1',
				type: 'importer-type-medium',
				importerState: appStates.IMPORTING,
			};
			const { recordTracksEvent, update } = renderSectionImport( [] );

			update( [ wordpress, medium ] );
			update( [ wordpress, medium ] );
			update( [ wordpress, { ...medium, importerState: appStates.IMPORT_FAILURE } ] );
			update( [ wordpress, { ...medium, importerState: appStates.IMPORT_FAILURE } ] );

			expect( recordTracksEvent.mock.calls ).toEqual( [
				[ 'calypso_importer_import_start', { importer_id: 'importer-type-wordpress' } ],
				[ 'calypso_importer_import_start', { importer_id: 'importer-type-medium' } ],
				[ 'calypso_importer_import_fail', { importer_id: 'importer-type-medium' } ],
			] );
		} );

		test( 'records again for a new import job of the same importer', () => {
			const readyForUpload = {
				site: { ID: 1 },
				type: 'importer-type-wordpress',
				importerState: appStates.READY_FOR_UPLOAD,
			};
			const { recordTracksEvent, update } = renderSectionImport( [] );

			update( [ { ...readyForUpload, importerId: 'wordpress-1' } ] );
			update( [] );
			update( [ { ...readyForUpload, importerId: 'wordpress-2' } ] );

			expect( recordTracksEvent.mock.calls ).toEqual( [
				[ 'calypso_importer_view', { importer_id: 'importer-type-wordpress' } ],
				[ 'calypso_importer_view', { importer_id: 'importer-type-wordpress' } ],
			] );
		} );
	} );
} );
