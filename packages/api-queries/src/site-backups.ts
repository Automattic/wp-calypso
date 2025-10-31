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
		mutationFn: () => updateRetentionDays( siteId, retentionDays ),
	} );
