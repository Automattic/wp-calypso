import { wpcom } from '../wpcom-fetcher';
import type { RestoreConfig } from './types';

/**
 * Initiate a restore operation for a site to a specific timestamp.
 * @param siteId - The ID of the site to restore.
 * @param timestamp - Unix timestamp to restore site to.
 * @param calypsoEnv - The environment ID of the Calypso instance.
 * @param restoreConfig - Restore configuration specifying what to restore.
 * @returns A promise that resolves to the restore ID.
 */
export async function initiateSiteBackupRestore(
	siteId: number,
	timestamp: string | number,
	calypsoEnv: string,
	restoreConfig: RestoreConfig = {}
): Promise< number > {
	const data: { restore_id: string } = await wpcom.req.post( {
		apiVersion: '1',
		path: `/activity-log/${ siteId }/rewind/to/${ timestamp }`,
		body: {
			types: restoreConfig,
			calypso_env: calypsoEnv,
			force_rewind: true,
		},
	} );

	return Number( data.restore_id );
}
