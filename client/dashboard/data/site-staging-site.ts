import wpcom from 'calypso/lib/wp';

export interface StagingSite {
	id: number;
	name: string;
	url: string;
	user_has_permission: boolean;
}

export type StagingSiteSyncDirection = 'pull' | 'push';

export type StagingSiteSyncStateOptions =
	| 'sqls'
	| 'themes'
	| 'plugins'
	| 'uploads'
	| 'roots'
	| 'contents';

export type StagingSiteSyncStatus =
	| 'pending'
	| 'backing_up'
	| 'restoring'
	| 'completed'
	| 'failed'
	| 'allow_retry';

export interface StagingSiteSyncState {
	direction: StagingSiteSyncDirection;
	options: StagingSiteSyncStateOptions[];
	production_blog_id: number;
	staging_blog_id: number;
	status: StagingSiteSyncStatus;
	started_at: number;
	updated_at: number;
	completed_at: number;
	restore_id: number;
	last_restore_id: number;
}

export async function createStagingSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/staging-site`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteStagingSite( stagingSiteId: number, productionSiteId: number ) {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ productionSiteId }/staging-site/${ stagingSiteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchStagingSiteOf(
	productionSiteId: number
): Promise< Array< StagingSite > > {
	return wpcom.req.get( {
		path: `/sites/${ productionSiteId }/staging-site`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchStagingSiteSyncState( siteId: number ) {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/staging-site/sync-state`,
		apiNamespace: 'wpcom/v2',
	} );
}
