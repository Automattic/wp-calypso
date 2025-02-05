import { useState } from 'react';
import { LogType } from 'calypso/data/hosting/use-site-logs-query';
import type { View } from '@wordpress/dataviews';

const getSortField = ( logType: LogType ) => ( logType === 'php' ? 'timestamp' : 'date' );
const getVisibleFields = ( logType: LogType ) => {
	if ( logType === 'php' ) {
		return [ 'severity', 'timestamp', 'message' ];
	}
	return [ 'request_type', 'date', 'status', 'request_url' ];
};

const useView = ( { logType }: { logType: LogType } ) => {
	return useState< View >( () => {
		return {
			type: 'table' as const,
			page: 1,
			perPage: 50,
			sort: {
				field: getSortField( logType ),
				direction: 'desc',
			},
			fields: getVisibleFields( logType ),
			layout: {
				styles: {
					request_url: {
						maxWidth: '300px',
					},
					http_referer: {
						maxWidth: '300px',
					},
					message: {
						maxWidth: '300px',
					},
					file: {
						maxWidth: '300px',
					},
				},
			},
		};
	} );
};

export default useView;
export { getSortField, getVisibleFields };
