import { wpcom } from '../wpcom-fetcher';
import type {
	WordPressMigrationConfiguration,
	WordPressMigrationStatus,
	WordPressMigrationCancellation,
} from './types';

export async function fetchWordPressMigrationStatus(
	siteId: number
): Promise< WordPressMigrationStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/wordpress-migration/status`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchWordPressMigrationConfiguration(
	siteId: number
): Promise< WordPressMigrationConfiguration > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/wordpress-migration/configure`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchWordPressMigrationCancellation(
	siteId: number
): Promise< WordPressMigrationCancellation > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/wordpress-migration/cancel`,
		apiNamespace: 'wpcom/v2',
	} );
}
