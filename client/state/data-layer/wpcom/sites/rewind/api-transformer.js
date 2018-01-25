/** @format */

/**
 * External dependencies
 */
import { camelCase } from 'lodash';

const transformCredential = data =>
	Object.assign(
		{
			type: data.type,
		},
		data.host && { host: data.host, port: data.port }
	);

const transformDownload = data =>
	Object.assign(
		{
			downloadId: data.downloadId,
			rewindId: data.rewindId,
			backupPoint: new Date( data.backupPoint * 1000 ),
			startedAt: new Date( data.startedAt * 1000 ),
		},
		data.downloadCount && { downloadCount: data.downloadCount },
		data.validUntil && { validUntil: new Date( data.validUntil * 1000 ) }
	);

const transformRewind = data =>
	Object.assign(
		{
			restoreId: data.restore_id,
			startedAt: new Date( data.started_at ),
			status: data.status,
		},
		data.percent && { percent: data.percent },
		data.reason && { reason: data.reason }
	);

export const transformApi = data =>
	Object.assign(
		{
			state: camelCase( data.state ),
			lastUpdated: new Date( data.last_updated * 1000 ),
		},
		data.credentials && { credentials: data.credentials.map( transformCredential ) },
		data.downloads && { downloads: data.downloads.map( transformDownload ) },
		data.reason && { failureReason: data.reason },
		data.rewind && { rewind: transformRewind( data.rewind ) }
	);
