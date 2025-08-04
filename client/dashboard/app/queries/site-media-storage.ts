import { queryOptions } from '@tanstack/react-query';
import filesize from 'filesize';
import { fetchSiteMediaStorage } from '../../data/site-media-storage';

const ALERT_PERCENT = 80;

export const siteMediaStorageQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'media-storage' ],
		queryFn: () => fetchSiteMediaStorage( siteId ),
		select: ( data ) => {
			return {
				...data,
				extra: {
					alertLevel: getAlertLevel( data.storage_used_bytes, data.max_storage_bytes ),
					storageUsedDisplay: filesize( data.storage_used_bytes, { round: 0 } ),
					maxStorageDisplay: filesize( data.max_storage_bytes, { round: 0 } ),
				},
			};
		},
	} );

function getAlertLevel(
	storageUsedBytes: number,
	maxStorageBytes: number
): 'none' | 'low' | 'exceeded' {
	const storageUsagePercent = Math.round( ( ( storageUsedBytes / maxStorageBytes ) * 1000 ) / 10 );

	if ( storageUsagePercent > 100 ) {
		return 'exceeded';
	} else if ( storageUsagePercent > ALERT_PERCENT ) {
		return 'low';
	}
	return 'none';
}
