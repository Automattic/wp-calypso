import { wpcom } from '../wpcom-fetcher';
import type {
	WordPressMigrationConfiguration,
	WordPressMigrationConfigureParams,
	WordPressMigrationRunParams,
	WordPressMigrationStatus,
} from './types';

// Saving a configuration also resets any earlier run, so only call this from a user action.
export async function configureWordPressMigration(
	siteId: number,
	params: WordPressMigrationConfigureParams
): Promise< WordPressMigrationConfiguration > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/wordpress-migration/configure`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );
}

export async function runWordPressMigration(
	siteId: number,
	params: WordPressMigrationRunParams
): Promise< WordPressMigrationStatus > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/wordpress-migration/run`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );
}
