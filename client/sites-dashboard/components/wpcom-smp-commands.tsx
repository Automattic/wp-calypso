import { COMMANDS } from '@automattic/command-palette';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import deepmerge from 'deepmerge';
import {
	EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
	getEdgeCacheStatus,
	useSetEdgeCacheMutation,
	purgeEdgeCache,
} from 'calypso/data/hosting/use-cache';
import { navigate } from 'calypso/lib/navigate';
import wpcom from 'calypso/lib/wp';
import { useOpenPhpMyAdmin } from 'calypso/my-sites/hosting/phpmyadmin-card';
import { useDispatch } from 'calypso/state';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import { createNotice, removeNotice } from 'calypso/state/notices/actions';
import { NoticeStatus } from 'calypso/state/notices/types';
import type { Command } from '@automattic/command-palette';

export const useCommandsCalypso = () => {
	const { __ } = useI18n();
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
			copyType === 'username' ? __( 'Copying username…' ) : __( 'Copying SSH connection string…' );
		const { removeNotice: removeLoadingNotice } = displayNotice( loadingMessage, 'is-plain', 5000 );
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			removeLoadingNotice();
			displayNotice(
				__( 'SFTP/SSH credentials must be created before SSH connection string can be copied.' ),
				'is-error',
				null,
				{
					button: __( 'Manage Hosting Configuration' ),
					onClick: () => navigate( `/hosting-config/${ siteSlug }#sftp-credentials` ),
				}
			);
			return;
		}

		const textToCopy = copyType === 'username' ? sshUser : `ssh ${ sshUser }@sftp.wp.com`;
		navigator.clipboard.writeText( textToCopy );
		removeLoadingNotice();
		const successMessage =
			copyType === 'username' ? __( 'Copied username.' ) : __( 'Copied SSH connection string.' );
		displayNotice( successMessage );
	};

	const resetSshSftpPassword = async ( siteId: number, siteSlug: string ) => {
		const { removeNotice: removeLoadingNotice } = displayNotice(
			__( 'Resetting SFTP/SSH password…' ),
			'is-plain',
			5000
		);
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			removeLoadingNotice();
			displayNotice(
				__( 'SFTP/SSH credentials must be created before SFTP/SSH password can be reset.' ),
				'is-error',
				null,
				{
					button: __( 'Manage Hosting Configuration' ),
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
			displayNotice( __( 'Unexpected error resetting SFTP/SSH password.' ), 'is-error', 5000 );
			return;
		}

		navigator.clipboard.writeText( sshPassword );
		removeLoadingNotice();
		displayNotice( __( 'SFTP/SSH password reset and copied to clipboard.' ) );
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
			displayNotice( __( 'Failed to clear cache.' ), 'is-error' );
		}
	};

	const enableEdgeCache = async ( siteId: number ) => {
		const currentStatus = await getEdgeCacheStatus( siteId );

		// Check if the cache is already active
		if ( currentStatus ) {
			// Display a different notice if the cache is already active
			displayNotice( __( 'Edge cache is already enabled.' ), 'is-success', 5000, {
				id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
			} );
			return;
		}

		setEdgeCache( siteId, true );
	};

	const disableEdgeCache = async ( siteId: number ) => {
		const currentStatus = await getEdgeCacheStatus( siteId );

		if ( ! currentStatus ) {
			displayNotice( __( 'Edge cache is already disabled.' ), 'is-success', 5000, {
				id: EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
			} );
			return;
		}

		setEdgeCache( siteId, false );
	};

	const { openPhpMyAdmin } = useOpenPhpMyAdmin();

	// Create URLSearchParams for send feedback by email command
	const { setInitialRoute, setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const emailUrl = `/contact-form?${ new URLSearchParams( {
		mode: 'EMAIL',
		'disable-gpt': 'true',
		'source-command-palette': 'true',
	} ).toString() }`;

	const commands: Command[] = Object.values(
		deepmerge( COMMANDS, {
			getHelp: {
				callback: ( { close } ) => {
					close();
					setShowHelpCenter( true );
				},
			},
			clearCache: {
				callback: ( { site, close } ) => {
					close();
					clearEdgeCache( site.ID );
				},
			},
			enableEdgeCache: {
				callback: ( { site, close } ) => {
					close();
					enableEdgeCache( site.ID );
				},
			},
			disableEdgeCache: {
				callback: ( { site, close } ) => {
					close();
					disableEdgeCache( site.ID );
				},
			},
			openPHPmyAdmin: {
				callback: async ( { site, close } ) => {
					close();
					await openPhpMyAdmin( site.ID );
				},
			},
			copySshConnectionString: {
				callback: async ( { site, close } ) => {
					close();
					await copySshSftpDetails( site.ID, 'connectionString', site.slug );
				},
			},
			resetSshSftpPassword: {
				callback: async ( { site, close } ) => {
					close();
					resetSshSftpPassword( site.ID, site.slug );
				},
			},
			sendFeedback: {
				callback: ( { close }: { close: () => void } ) => {
					close();
					setInitialRoute( emailUrl );
					setShowHelpCenter( true );
				},
			},
		} )
	);

	return commands;
};
