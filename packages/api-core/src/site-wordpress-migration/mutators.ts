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

// Our team takes the migration over. They ask the customer for access to their site next.
export async function handOffWordPressMigration(
	siteId: number
): Promise< WordPressMigrationStatus > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/wordpress-migration/assisted-handoff`,
		apiNamespace: 'wpcom/v2',
	} );
}

// The customer takes the migration back from our team, or asks our team to stop once they're running it.
export async function cancelWordPressMigrationHandoff(
	siteId: number
): Promise< WordPressMigrationStatus > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/wordpress-migration/assisted-handoff`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
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
