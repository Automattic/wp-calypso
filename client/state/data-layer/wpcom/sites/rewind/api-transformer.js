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
		data.role && { role: data.role },
		data.host && { host: data.host },
		data.port && { port: data.port },
		data.user && { user: data.user },
		'undefined' !== typeof data.password && { password: data.password },
		data.abspath && { abspath: data.abspath },
		'undefined' !== typeof data.kpri && { kpri: data.kpri },
		data.baseUrl && { baseUrl: data.baseUrl },
		data.maxConcurrent && { maxConcurrent: data.maxConcurrent }
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

const transformRestore = data =>
	Object.assign( { status: data.status }, data.percent && { percent: data.percent } );

export const transformApi = data =>
	Object.assign(
		{
			state: camelCase( data.state ),
			lastUpdated: new Date( data.last_updated * 1000 ),
		},
		data.credentials && { credentials: data.credentials.map( transformCredential ) },
		data.downloads && { downloads: data.downloads.map( transformDownload ) },
		data.reason && { failureReason: data.reason },
		data.rewinds && { rewinds: data.rewinds.map( transformRestore ) }
	);
