import {
	fetchSiteBackupActivityLog,
	enqueueSiteBackup,
	fetchSiteBackups,
	fetchBackupContents,
	fetchBackupPathInfo,
	fetchBackupFileUrl,
	fetchBackupPolicies,
	fetchBackupSize,
	updateRetentionDays,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { BackupContentsResponse } from '@automattic/api-core';

export const BACKUP_PLUGINS_PATH = '/wp-content/plugins/';

export const WOOCOMMERCE_SUBSCRIPTIONS_PLUGIN_SLUG = 'woocommerce-subscriptions';

// Matches on raw `contents` keys (directory slugs), not the API display labels
// the file browser substitutes in their place.
export const selectBackupIncludesPlugin =
	( slug: string ) =>
	( response: BackupContentsResponse ): boolean =>
		!! response?.ok &&
		Object.keys( response.contents ?? {} ).some(
			( name ) => name.toLowerCase() === slug.toLowerCase()
		);

export const siteLastBackupQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'last' ],
		queryFn: () => fetchSiteBackupActivityLog( siteId, { number: 1 } ),
		select: ( data ) => data.current?.orderedItems[ 0 ] ?? null,
	} );

export const siteBackupsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups' ],
		queryFn: () => fetchSiteBackups( siteId ),
	} );

export const siteBackupEnqueueMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-backup-enqueue' },
		mutationFn: () => enqueueSiteBackup( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteBackupsQuery( siteId ) );
		},
	} );

export const siteBackupContentsQuery = ( siteId: number, rewindId: number, path: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', rewindId, 'contents', path ],
		queryFn: () => fetchBackupContents( siteId, rewindId, path ),
		staleTime: Infinity,
	} );

export const siteBackupPathInfoQuery = (
	siteId: number,
	rewindId: string,
	manifestPath: string,
	extensionType = ''
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', rewindId, 'path-info', manifestPath, extensionType ],
		queryFn: () => fetchBackupPathInfo( siteId, rewindId, manifestPath, extensionType ),
		staleTime: Infinity,
	} );

export const siteBackupFileUrlQuery = (
	siteId: number,
	rewindId: string,
	encodedManifestPath: string
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', rewindId, 'file', encodedManifestPath ],
		queryFn: () => fetchBackupFileUrl( siteId, rewindId, encodedManifestPath ),
		meta: { persist: false },
	} );

export const siteBackupPoliciesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup-policies' ],
		queryFn: () => fetchBackupPolicies( siteId ),
		staleTime: Infinity,
	} );

export const siteBackupSizeQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup-size' ],
		queryFn: () => fetchBackupSize( siteId ),
	} );

export const siteUpdateRetentionDaysMutation = ( siteId: number, retentionDays: number ) =>
	mutationOptions( {
		meta: { statId: 'site-retention-days-update' },
		mutationFn: () => updateRetentionDays( siteId, retentionDays ),
	} );
