import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { appStates } from 'calypso/state/imports/constants';
import type { ImportJob } from 'calypso/blocks/importer/types';

const stateEvents: Record< string, string > = {
	[ appStates.READY_FOR_UPLOAD ]: 'calypso_importer_view',
	[ appStates.UPLOADING ]: 'calypso_importer_upload_start',
	[ appStates.UPLOAD_SUCCESS ]: 'calypso_importer_upload_success',
	[ appStates.UPLOAD_FAILURE ]: 'calypso_importer_upload_fail',
	[ appStates.MAP_AUTHORS ]: 'calypso_importer_map_authors_view',
	[ appStates.IMPORTING ]: 'calypso_importer_import_start',
	[ appStates.IMPORT_SUCCESS ]: 'calypso_importer_import_success',
	[ appStates.IMPORT_FAILURE ]: 'calypso_importer_import_fail',
};

type TrackedImportJob = ImportJob & { file?: { size: number } };

export function useTrackImporterState( job?: TrackedImportJob ) {
	const lastTrackedStates = useRef( new Map< string, string >() );

	useEffect( () => {
		if ( ! job ) {
			return;
		}

		const { importerState, errorData } = job;
		const jobKey = `${ job.site.ID }:${ job.importerId }`;
		const trackedState = JSON.stringify( [ importerState, errorData?.code, errorData?.type ] );
		if ( lastTrackedStates.current.get( jobKey ) === trackedState ) {
			return;
		}
		lastTrackedStates.current.set( jobKey, trackedState );

		const eventName = stateEvents[ importerState ];
		if ( ! eventName ) {
			return;
		}

		const isFailure =
			importerState === appStates.UPLOAD_FAILURE || importerState === appStates.IMPORT_FAILURE;
		const minMegabytes = job.file?.size
			? Math.floor( job.file.size / ( 1024 * 1024 * 100 ) ) * 100
			: null;

		recordTracksEvent( eventName, {
			importer_id: job.type,
			...( isFailure && {
				error_code: errorData?.code,
				error_type: errorData?.type,
				importer_file_type: job.importerFileType,
			} ),
			...( importerState === appStates.UPLOAD_FAILURE && {
				filesize_range:
					minMegabytes === null ? null : `${ minMegabytes }—${ minMegabytes + 100 }MB`,
			} ),
		} );
	}, [ job ] );
}
