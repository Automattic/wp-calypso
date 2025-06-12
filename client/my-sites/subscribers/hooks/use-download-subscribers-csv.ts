import { saveAs } from 'browser-filesaver';
import { translate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { useRecordExport } from '../tracks';

export const useDownloadSubscribersCSV = ( siteId: number | null ) => {
	const [ isDownloading, setIsDownloading ] = useState( false );
	const dispatch = useDispatch();
	const recordExport = useRecordExport();

	const downloadCSV = useCallback( async () => {
		if ( ! siteId ) {
			return;
		}

		setIsDownloading( true );

		try {
			const response: string = await wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers/export`,
				apiNamespace: 'wpcom/v2',
			} );

			// Download the CSV.
			const blob = new Blob( [ response ], { type: 'text/csv;charset=utf-8;' } );
			saveAs( blob, `subscribers-export-${ siteId }.csv` );

			// Record that it happened.
			dispatch(
				recordGoogleEvent(
					'Subscribers',
					'Clicked Download email subscribers as CSV menu item on Subscribers'
				)
			);
			recordExport();
		} catch ( error ) {
			dispatch(
				errorNotice(
					translate( 'An unknown error has occurred. Please contact support for help.' ),
					{
						duration: 5000,
					}
				)
			);
		} finally {
			setIsDownloading( false );
		}
	}, [ siteId, dispatch, recordExport ] );

	return {
		downloadCSV,
		isDownloading,
	};
};
