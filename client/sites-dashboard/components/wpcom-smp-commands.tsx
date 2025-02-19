import { useCommands } from '@automattic/command-palette';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import deepmerge from 'deepmerge';
import { useTranslate } from 'i18n-calypso';
import {
	EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
	getEdgeCacheStatus,
	useSetEdgeCacheMutation,
	purgeEdgeCache,
} from 'calypso/data/hosting/use-cache';
import { navigate } from 'calypso/lib/navigate';
import wpcom from 'calypso/lib/wp';
import { useOpenPhpMyAdmin } from 'calypso/sites/settings/database/form';
import { useDispatch } from 'calypso/state';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import { createNotice, removeNotice } from 'calypso/state/notices/actions';
import { NoticeStatus } from 'calypso/state/notices/types';
import type { Command, CommandCallBackParams } from '@automattic/command-palette';

export const useCommandsCalypso = (): Command[] => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { setEdgeCache } = useSetEdgeCacheMutation();

	const displayNotice = (
		message: string,
		noticeType: NoticeStatus = 'is-success',
		duration: undefined | number | null = 5000,
		additionalOptions: { button?: string; id?: string; onClick?: () => void } = {}
	) => {
		const { notice } = dispatch(
			createNotice( noticeType, message, { duration, ...additionalOptions } )
		);
		return {
			removeNotice: () => dispatch( removeNotice( notice.noticeId ) ),
		};
	};

	const fetchSshUser = async ( siteId: number ) => {
		const response = await wpcom.req.get( {
			path: `/sites/${ siteId }/hosting/ssh-users`,
			apiNamespace: 'wpcom/v2',
		} );

		const sshUserResponse = response?.users;

		if ( ! sshUserResponse?.length ) {
			return null;
		}

		return sshUserResponse[ 0 ];
	};

	const copySshSftpDetails = async (
		siteId: number,
		copyType: 'username' | 'connectionString',
		siteSlug: string
	) => {
		const loadingMessage =
			copyType === 'username'
				? translate( 'Copying username…' )
				: translate( 'Copying SSH connection string…' );
		const { removeNotice: removeLoadingNotice } = displayNotice( loadingMessage, 'is-plain', 5000 );
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			removeLoadingNotice();
			displayNotice(
				translate(
					'SFTP/SSH credentials must be created before SSH connection string can be copied.'
				),
				'is-error',
				null,
				{
					button: translate( 'Manage Hosting Configuration' ),
					onClick: () => navigate( `/hosting-config/${ siteSlug }#sftp-credentials` ),
				}
			);
			return;
		}

		const textToCopy = copyType === 'username' ? sshUser : `ssh ${ sshUser }@sftp.wp.com`;
		navigator.clipboard.writeText( textToCopy );
		removeLoadingNotice();
		const successMessage =
			copyType === 'username'
				? translate( 'Copied username.' )
				: translate( 'Copied SSH connection string.' );
		displayNotice( successMessage );
	};

	const resetSshSftpPassword = async ( siteId: number, siteSlug: string ) => {
		const { removeNotice: removeLoadingNotice } = displayNotice(
			translate( 'Resetting SFTP/SSH password…' ),
			'is-plain',
			5000
		);
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			removeLoadingNotice();
			displayNotice(
				translate( 'SFTP/SSH credentials must be created before SFTP/SSH password can be reset.' ),
				'is-error',
				null,
				{
					button: translate( 'Manage Hosting Configuration' ),
					onClick: () => navigate( `/hosting-config/${ siteSlug }#sftp-credentials` ),
				}
			);
			return;
		}

		const response = await wpcom.req.post( {
			path: `/sites/${ siteId }/hosting/ssh-user/${ sshUser }/reset-password`,
			apiNamespace: 'wpcom/v2',
			body: {},
		} );
		const sshPassword = response?.password;

		if ( ! sshPassword ) {
			removeLoadingNotice();
			displayNotice(
				translate( 'Unexpected error resetting SFTP/SSH password.' ),
				'is-error',
				5000
			);
			return;
		}

		navigator.clipboard.writeText( sshPassword );
		removeLoadingNotice();
		displayNotice( translate( 'SFTP/SSH password reset and copied to clipboard.' ) );
	};

	const clearEdgeCache = async ( siteId: number ) => {
		try {
			const response = await getEdgeCacheStatus( siteId );

			if ( response ) {
				// If global cache is active, purge the cache
				await purgeEdgeCache( siteId );
			}
			// Always clear the WordPress cache.
			dispatch( clearWordPressCache( siteId, 'Clear cache via command palette' ) );
		} catch ( error ) {
			displayNotice( translate( 'Failed to clear cache.' ), 'is-error' );
		}
	};

	const enableEdgeCache = async ( siteId: number ) => {
		const currentStatus = await getEdgeCacheStatus( siteId );

		// Check if the cache is already active
		if ( currentStatus ) {
			// Display a different notice if the cache is already active
			displayNotice( translate( 'Edge cache is already enabled.' ), 'is-success', 5000, {
				id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
			} );
			return;
		}

		setEdgeCache( siteId, true );
	};

	const disableEdgeCache = async ( siteId: number ) => {
		const currentStatus = await getEdgeCacheStatus( siteId );

		if ( ! currentStatus ) {
			displayNotice( translate( 'Edge cache is already disabled.' ), 'is-success', 5000, {
				id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
			} );
			return;
		}

		setEdgeCache( siteId, false );
	};

	const { openPhpMyAdmin } = useOpenPhpMyAdmin();

	// Create URLSearchParams for send feedback by email command
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );
	// Only override commands that need a specific behavior for Calypso.
	// Commands need to be defined in `packages/command-palette/src/commands.tsx`.
	const defaultCommands = useCommands();
	const commands = Object.values(
		deepmerge( defaultCommands, {
			switchSite: {
				// This command is explicitly about switching sites, it should therefore always display the site selector
				// where possible.
				alwaysUseSiteSelector: true,
			},
			getHelp: {
				callback: ( { close }: CommandCallBackParams ) => {
					close();
					setShowHelpCenter( true );
				},
			},
			clearCache: {
				callback: async ( { site, close }: CommandCallBackParams ) => {
					close();
					if ( site ) {
						await clearEdgeCache( site.ID );
					}
				},
			},
			enableEdgeCache: {
				callback: async ( { site, close }: CommandCallBackParams ) => {
					close();
					if ( site ) {
						await enableEdgeCache( site.ID );
					}
				},
			},
			disableEdgeCache: {
				callback: async ( { site, close }: CommandCallBackParams ) => {
					close();
					if ( site ) {
						await disableEdgeCache( site.ID );
					}
				},
			},
			openPHPmyAdmin: {
				callback: async ( { site, close }: CommandCallBackParams ) => {
					close();
					if ( site ) {
						await openPhpMyAdmin( site.ID );
					}
				},
			},
			copySshConnectionString: {
				callback: async ( { site, close }: CommandCallBackParams ) => {
					close();
					if ( site ) {
						await copySshSftpDetails( site.ID, 'connectionString', site.slug );
					}
				},
			},
			resetSshSftpPassword: {
				callback: async ( { site, close }: CommandCallBackParams ) => {
					close();
					if ( site ) {
						await resetSshSftpPassword( site.ID, site.slug );
					}
				},
			},
		} )
	) as Command[];

	return commands;
};
