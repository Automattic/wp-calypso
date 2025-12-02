import {
	fetchSshAccessStatus,
	enableSshAccess,
	disableSshAccess,
	fetchSiteSshKeys,
	attachSiteSshKey,
	detachSiteSshKey,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { SiteSshKey } from '@automattic/api-core';

export const siteSshAccessStatusQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'ssh-access' ],
		queryFn: () => fetchSshAccessStatus( siteId ),
	} );

export const siteSshAccessEnableMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => enableSshAccess( siteId ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( siteSshAccessStatusQuery( siteId ).queryKey, data );
		},
	} );

export const siteSshAccessDisableMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => disableSshAccess( siteId ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( siteSshAccessStatusQuery( siteId ).queryKey, data );
		},
	} );

export const siteSshKeysQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'ssh-keys' ],
		queryFn: () => fetchSiteSshKeys( siteId ),
	} );

export const siteSshKeysAttachMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( name: string ) => attachSiteSshKey( siteId, name ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteSshKeysQuery( siteId ) );
		},
	} );

export const siteSshKeysDetachMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( siteSshKey: SiteSshKey ) =>
			detachSiteSshKey( siteId, siteSshKey.user_login, siteSshKey.name ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteSshKeysQuery( siteId ) );
		},
	} );
