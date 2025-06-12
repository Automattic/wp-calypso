import {
	fetchSshAccessStatus,
	enableSshAccess,
	disableSshAccess,
	fetchSiteSshKeys,
	attachSiteSshKey,
	detachSiteSshKey,
} from '../../data/site-hosting-ssh';
import { queryClient } from '../query-client';
import type { SshAccessStatus, SiteSshKey } from '../../data/site-hosting-ssh';

export const siteSshAccessStatusQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'ssh-access' ],
	queryFn: () => {
		return fetchSshAccessStatus( siteId );
	},
} );

export const siteSshAccessEnableMutation = ( siteId: number ) => ( {
	mutationFn: () => enableSshAccess( siteId ),
	onSuccess: ( data: SshAccessStatus ) => {
		queryClient.setQueryData( siteSshAccessStatusQuery( siteId ).queryKey, data );
	},
} );

export const siteSshAccessDisableMutation = ( siteId: number ) => ( {
	mutationFn: () => disableSshAccess( siteId ),
	onSuccess: ( data: SshAccessStatus ) => {
		queryClient.setQueryData( siteSshAccessStatusQuery( siteId ).queryKey, data );
	},
} );

export function siteSshKeysQuery( siteId: number ) {
	return {
		queryKey: [ 'site', siteId, 'ssh-keys' ],
		queryFn: () => {
			return fetchSiteSshKeys( siteId );
		},
	};
}

export function siteSshKeysAttachMutation( siteId: number ) {
	return {
		mutationFn: ( name: string ) => attachSiteSshKey( siteId, name ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteSshKeysQuery( siteId ) );
		},
	};
}

export function siteSshKeysDetachMutation( siteId: number ) {
	return {
		mutationFn: ( siteSshKey: SiteSshKey ) =>
			detachSiteSshKey( siteId, siteSshKey.user_login, siteSshKey.name ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteSshKeysQuery( siteId ) );
		},
	};
}
