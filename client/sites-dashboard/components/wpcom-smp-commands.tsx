import { COMMANDS } from '@automattic/command-palette';
import { SiteCapabilities } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import deepmerge from 'deepmerge';
import { useCallback } from 'react';
import {
	EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
	getEdgeCacheStatus,
	useSetEdgeCacheMutation,
	purgeEdgeCache,
} from 'calypso/data/hosting/use-cache';
import { navigate } from 'calypso/lib/navigate';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import wpcom from 'calypso/lib/wp';
import { useOpenPhpMyAdmin } from 'calypso/my-sites/hosting/phpmyadmin-card';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { clearWordPressCache } from 'calypso/state/hosting/actions';
import { createNotice, removeNotice } from 'calypso/state/notices/actions';
import { NoticeStatus } from 'calypso/state/notices/types';
import { getCurrentRoutePattern } from 'calypso/state/selectors/get-current-route-pattern';
import type {
	Command,
	CommandCallBackParams,
	useCommandsParams,
} from '@automattic/command-palette';
import type { SiteExcerptData } from '@automattic/sites';

function useCommandNavigation() {
	const dispatch = useDispatch();
	const currentRoute = useSelector( getCurrentRoutePattern );
	// Callback to navigate to a command's destination
	// used on command callback or siteFunctions onClick
	const commandNavigation = useCallback(
		( url: string, { openInNewTab = false } = {} ) =>
			( { close, command }: Pick< CommandCallBackParams, 'close' | 'command' > ) => {
				dispatch(
					recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
						command: command.name,
						current_route: currentRoute,
						is_wp_admin: url.includes( '/wp-admin' ),
					} )
				);

				close();
				navigate( url, openInNewTab );
			},
		[ currentRoute, dispatch ]
	);
	return commandNavigation;
}

export const useCommandsCalypso = ( { setSelectedCommandName }: useCommandsParams ) => {
	const { __ } = useI18n();
	const setStateCallback =
		( actionName: string, placeholder: string = __( 'Select a site' ) ) =>
		( { setSearch, setPlaceholderOverride }: CommandCallBackParams ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
			setPlaceholderOverride( placeholder );
		};

	const commandNavigation = useCommandNavigation();
	const dispatch = useDispatch();

	const navigateWithinSamePage = (
		targetPath: string,
		elementId: string,
		commandParams: Pick< CommandCallBackParams, 'close' | 'command' >
	) => {
		const currentPath = window.location.pathname;
		const targetUrl = new URL( targetPath, window.location.origin );

		// Check if the user is on the same page but is not looking at the right section
		// If not, scroll to the right section
		if ( currentPath === targetUrl.pathname ) {
			//Offset by the height of the navigation header from the top of the page
			const fixedHeaderHeight = 72;
			const element = document.getElementById( elementId );
			if ( element ) {
				const elementPosition = element.getBoundingClientRect().top + window.scrollY;
				const offsetPosition = elementPosition - fixedHeaderHeight;

				window.location.hash = elementId;
				commandParams.close();
				window.scrollTo( {
					top: offsetPosition,
					behavior: 'smooth',
				} );
			}
		} else {
			commandNavigation( targetPath )( commandParams );
		}
	};

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
			viewMySites: {
				callback: commandNavigation( '/sites' ),
			},
			getHelp: {
				callback: ( { close } ) => {
					close();
					setShowHelpCenter( true );
				},
			},
			clearCache: {
				callback: setStateCallback( 'clearCache', __( 'Select a site to clear cache' ) ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						clearEdgeCache( site.ID );
					},
				},
			},
			enableEdgeCache: {
				callback: setStateCallback( 'enableEdgeCache', __( 'Select a site to enable edge cache' ) ),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						enableEdgeCache( site.ID );
					},
				},
			},
			disableEdgeCache: {
				callback: setStateCallback(
					'disableEdgeCache',
					__( 'Select a site to disable edge cache' )
				),
				siteFunctions: {
					onClick: ( { site, close } ) => {
						close();
						disableEdgeCache( site.ID );
					},
				},
			},
			manageCacheSettings: {
				siteFunctions: {
					onClick: ( param ) => {
						const targetPath = `/hosting-config/${ param.site.slug }#cache`;
						navigateWithinSamePage( targetPath, 'cache', param );
					},
				},
			},
			visitSite: {
				callback: setStateCallback( 'visitSite', __( 'Select site to visit the homepage' ) ),
				siteFunctions: {
					onClick: ( param ) =>
						commandNavigation( param.site.URL, { openInNewTab: true } )( param ),
				},
			},
			openSiteDashboard: {
				callback: setStateCallback( 'openSiteDashboard', __( 'Select site to open dashboard' ) ),
				siteFunctions: {
					onClick: ( param ) => commandNavigation( `/home/${ param.site.slug }` )( param ),
				},
			},
			openHostingConfiguration: {
				callback: setStateCallback(
					'openHostingConfiguration',
					__( 'Select site to open hosting configuration' )
				),
				siteFunctions: {
					onClick: ( param ) =>
						commandNavigation( `/hosting-config/${ param.site.slug }` )( param ),
				},
			},
			openPHPmyAdmin: {
				callback: setStateCallback( 'openPHPmyAdmin', __( 'Select site to open phpMyAdmin' ) ),
				siteFunctions: {
					onClick: async ( { site, close } ) => {
						close();
						await openPhpMyAdmin( site.ID );
					},
				},
			},
		} )
	);

	/*const commandsOld: Command[] = [
		{
			name: 'openProfile',
			label: __( 'Open my profile' ),
			searchLabel: [
				_x( 'open my profile', 'Keyword for the Open my profile command' ),
				_x( 'account', 'Keyword for the Open my profile command' ),
				_x( 'display name', 'Keyword for the Open my profile command' ),
				_x( 'gravatar', 'Keyword for the Open my profile command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/me` ),
			icon: profileIcon,
		},
		{
			name: 'viewDeveloperFeatures',
			label: __( 'View developer features' ),
			searchLabel: [
				_x( 'view developer features', 'Keyword for the View developer features command' ),
				_x( 'profile', 'Keyword for the View developer features command' ),
			].join( ' ' ),
			callback: commandNavigation( `/me/developer` ),
			icon: codeIcon,
		},
		{
			name: 'openReader',
			label: __( 'Open reader' ),
			callback: commandNavigation( `/read` ),
			icon: (
				<svg height="24" viewBox="4 4 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
					<clipPath id="a">
						<path d="m4 11.2002h24v10.2857h-24z"></path>
					</clipPath>
					<g clipPath="url(#a)">
						<path d="m4.94437 16.8443-.94437-.0656v-1.4979l1.05696-.0515c.73758-2.4238 2.27248-3.924 4.78852-4.0248 2.48152-.0961 4.13592 1.2541 5.05502 3.6099.3317-.1946.7077-.297 1.0903-.297s.7586.1024 1.0903.297c.9604-2.3863 2.6355-3.7505 5.1722-3.6005 2.4632.1406 3.9591 1.6408 4.6828 4.0177l1.057.0492v1.444c-.0528.0304-.0873.0726-.1149.0679-.6893-.1054-.9007.211-1.0615.8861-.586 2.4589-2.7872 3.9732-5.3538 3.7927-2.2977-.1618-4.2302-2.1097-4.5381-4.5475-.0359-.2323-.1505-.4444-.3239-.5995-.1734-.155-.3945-.2431-.625-.249-.2239.01-.4376.0984-.6051.2505-.1674.152-.2783.3582-.314.5839-.3332 2.5785-2.3506 4.4983-4.8115 4.5756-2.60796.0821-4.67824-1.608-5.20213-4.245-.01149-.1313-.05974-.2509-.0988-.3962zm5.05505 3.0942c.93708.0075 1.83898-.3643 2.50778-1.034.6689-.6696 1.0503-1.5824 1.0606-2.5384.0049-.9553-.3621-1.8736-1.0204-2.5531s-1.5541-1.0646-2.4905-1.0708c-.93734-.0075-1.83926.3647-2.50784 1.0349s-1.04921 1.5836-1.05831 2.5398c-.00302.4737.08568.9433.261 1.382.17532.4386.43381.8376.76065 1.1741s.7156.6038 1.14397.7866c.42836.1829.88789.2776 1.35223.2789zm11.96208 0c.9375 0 1.8366-.3798 2.4997-1.0558.6631-.6761 1.0359-1.593 1.0365-2.5494-.0048-.956-.381-1.871-1.046-2.5446-.665-.6735-1.5646-1.0507-2.5017-1.0488-.9374 0-1.8366.3797-2.4997 1.0557-.6631.6761-1.0359 1.5931-1.0365 2.5494.0021.4744.0958.9437.2757 1.3811s.4424.8344.7727 1.1683.7219.5982 1.1523.7777c.4304.1796.8912.2709 1.3562.2687z"></path>
					</g>
				</svg>
			),
		},
		{
			name: 'openJetpackSettings',
			label: __( 'Open Jetpack settings' ),
			callback: setStateCallback(
				'openJetpackSettings',
				__( 'Select site to open Jetpack settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) =>
					commandNavigation( `${ param.site.URL }/wp-admin/admin.php?page=jetpack#/dashboard` )(
						param
					),
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic || isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites with Jetpack settings available.' ),
				emptyListNotice: __( 'No sites with Jetpack settings available.' ),
			},
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'addJetpack',
			label: __( 'Add Jetpack to a self-hosted site' ),
			searchLabel: [
				_x(
					'Add Jetpack to a self-hosted site',
					'Keyword for Add Jetpack to a self-hosted site command'
				),
				_x( 'connect jetpack', 'Keyword for Add Jetpack to a self-hosted site command' ),
			].join( ' ' ),
			callback: commandNavigation( `/jetpack/connect?cta_from=command-palette` ),
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'manageJetpackModules',
			label: __( 'Manage Jetpack modules' ),
			callback: setStateCallback(
				'manageJetpackModules',
				__( 'Select site to manage Jetpack modules' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) =>
					commandNavigation( `${ param.site.URL }/wp-admin/admin.php?page=jetpack_modules` )(
						param
					),
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic || isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites with Jetpack modules available.' ),
				emptyListNotice: __( 'No sites with Jetpack modules available.' ),
			},
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'importSite',
			label: __( 'Import site to WordPress.com' ),
			searchLabel: [
				_x( 'Import site to WordPress.com', 'Keyword for Import site to WordPress.com command' ),
				_x( 'migrate site', 'Keyword for Import site to WordPress.com command' ),
			].join( ' ' ),
			callback: commandNavigation( `/start/import?ref=command-palette` ),
			icon: downloadIcon,
		},
		{
			name: 'addNewSite',
			label: __( 'Add new site' ),
			searchLabel: [
				_x( 'add new site', 'Keyword for the Add new site command' ),
				_x( 'create site', 'Keyword for the Add new site command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( createSiteUrl ),
			icon: plusIcon,
		},
		{
			name: 'openAccountSettings',
			label: __( 'Open account settings' ),
			searchLabel: [
				_x( 'open account settings', 'Keyword for the Open account settings command' ),
				_x( 'profile', 'Keyword for the Open account settings command' ),
				_x( 'email', 'Keyword for the Open account settings command' ),
				_x( 'language', 'Keyword for the Open account settings command' ),
			].join( ' ' ),
			callback: commandNavigation( `/me/account` ),
			icon: profileIcon,
		},
		{
			name: 'accessPurchases',
			label: __( 'View my purchases' ),
			searchLabel: [
				_x( 'view my purchases', 'Keyword for the View my purchases command' ),
				_x( 'manage purchases', 'Keyword for the View my purchases command' ),
				_x( 'billing history', 'Keyword for the View my purchases command' ),
				_x( 'credit card', 'Keyword for the View my purchases command' ),
				_x( 'payment methods', 'Keyword for the View my purchases command' ),
				_x( 'subscriptions', 'Keyword for the View my purchases command' ),
				_x( 'upgrades', 'Keyword for the View my purchases command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/me/purchases` ),
			icon: creditCardIcon,
		},
		{
			name: 'registerDomain',
			label: __( 'Register new domain' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/start/domain/domain-only?ref=command-palette` ),
			icon: domainsIcon,
		},
		{
			name: 'manageDomains',
			label: __( 'Manage domains' ),
			searchLabel: [
				_x( 'manage domains', 'Keyword for the Manage domains command' ),
				_x( 'dns', 'Keyword for the Manage domains command' ),
				_x( 'domain mapping', 'Keyword for the Manage domains command' ),
				_x( 'domain registration', 'Keyword for the Manage domains command' ),
				_x( 'domain transfer', 'Keyword for the Manage domains command' ),
				_x( 'email forwarding', 'Keyword for the Manage domains command' ),
				_x( 'nameservers', 'Keyword for the Manage domains command' ),
				_x( 'subdomains', 'Keyword for the Manage domains command' ),
				_x( 'whois', 'Keyword for the Manage domains command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/domains/manage` ),
			icon: domainsIcon,
		},
		{
			name: 'manageDns',
			label: __( 'Manage DNS records' ),
			searchLabel: [
				_x( 'manage dns records', 'Keyword for the Manage DNS records command' ),
				_x( 'cname', 'Keyword for the Manage DNS records command' ),
				_x( 'mx', 'Keyword for the Manage DNS records command' ),
				_x( 'txt', 'Keyword for the Manage DNS records command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'manageDns', __( 'Select site to open DNS records' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) =>
					commandNavigation( `/domains/manage/${ param.site.slug }/dns/${ param.site.slug }` )(
						param
					),
				filter: ( site: SiteExcerptData ) =>
					isCustomDomain( site.slug ) && ! isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites with DNS management available.' ),
				emptyListNotice: __( 'No sites with DNS management available.' ),
			},
			icon: domainsIcon,
		},
		{
			name: 'copySshConnectionString',
			label: __( 'Copy SSH connection string' ),
			callback: setStateCallback(
				'copySshConnectionString',
				__( 'Select site to copy SSH connection string' )
			),
			siteFunctions: {
				onClick: async ( { site, close } ) => {
					close();
					await copySshSftpDetails( site.ID, 'connectionString', site.slug );
				},
				...siteFilters.hostingEnabled,
			},
			icon: keyIcon,
		},
		{
			name: 'openSshCredentials',
			label: __( 'Open SFTP/SSH credentials' ),
			callback: setStateCallback(
				'openSshCredentials',
				__( 'Select site to open SFTP/SSH credentials' )
			),
			siteFunctions: {
				onClick: ( param ) => {
					const targetPath = `/hosting-config/${ param.site.slug }#admin-interface-style`;
					navigateWithinSamePage( targetPath, 'sftp-credentials', param );
				},
				...siteFilters.hostingEnabled,
			},
			icon: keyIcon,
		},
		{
			name: 'resetSshSftpPassword',
			label: __( 'Reset SFTP/SSH password' ),
			callback: setStateCallback(
				'resetSshSftpPassword',
				__( 'Select site to reset SFTP/SSH password' )
			),
			siteFunctions: {
				onClick: async ( { site, close } ) => {
					close();
					resetSshSftpPassword( site.ID, site.slug );
				},
				...siteFilters.hostingEnabled,
			},
			icon: keyIcon,
		},
		{
			name: 'openJetpackStats',
			label: __( 'Open Jetpack Stats' ),
			callback: setStateCallback( 'openJetpackStats', __( 'Select site to open Jetpack Stats' ) ),
			siteFunctions: {
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/stats',
						wpAdmin: '/admin.php?page=stats',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: statsIcon,
		},
		{
			name: 'openActivityLog',
			label: __( 'Open activity log' ),
			searchLabel: [
				_x( 'open activity log', 'Keyword for the Open activity log command' ),
				_x( 'jetpack activity log', 'Keyword for the Open activity log command' ),
				_x( 'audit log', 'Keyword for the Open activity log command' ),
			].join( ' ' ),
			callback: setStateCallback( 'openActivityLog', __( 'Select site to open activity log' ) ),
			siteFunctions: {
				onClick: ( param ) =>
					commandNavigation(
						`${
							siteUsesWpAdminInterface( param.site )
								? 'https://jetpack.com/redirect/?source=calypso-activity-log&site='
								: '/activity-log/'
						}${ param.site.slug }`
					)( param ),
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites hosted on WordPress.com.' ),
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openJetpackBackup',
			label: __( 'Open Jetpack Backup' ),
			callback: setStateCallback( 'openJetpackBackup', __( 'Select site to open Jetpack Backup' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) =>
					commandNavigation(
						`${
							siteUsesWpAdminInterface( param.site )
								? 'https://jetpack.com/redirect/?source=calypso-backups&site='
								: '/backup/'
						}${ param.site.slug }`
					)( param ),
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites with Jetpack Backup enabled.' ),
			},
			icon: backupIcon,
		},
		{
			name: 'viewSiteMonitoringMetrics',
			label: __( 'View site monitoring metrics' ),
			callback: setStateCallback(
				'viewSiteMonitoringMetrics',
				__( 'Select site to view monitoring metrics' )
			),
			siteFunctions: {
				onClick: ( param ) => commandNavigation( `/site-monitoring/${ param.site.slug }` )( param ),
				...siteFilters.hostingEnabled,
			},
			icon: statsIcon,
		},
		{
			name: 'openGitHubDeployments',
			label: __( 'Open GitHub Deployments' ),
			callback: setStateCallback(
				'openGitHubDeployments',
				__( 'Select site to open GitHub Deployments' )
			),
			searchLabel: [
				_x( 'open github deployments', 'Keyword for the Open GitHub Deployments command' ),
				_x( 'github', 'Keyword for the Open GitHub Deployments command' ),
				_x( 'deployments', 'Keyword for the Open GitHub Deployments command' ),
			].join( ' ' ),
			siteFunctions: {
				onClick: (
					param: Pick< CommandCallBackParams, 'close' | 'command' > & {
						site: SiteExcerptData;
					}
				) => {
					return commandNavigation( `/github-deployments/${ param.site.slug }` )( param );
				},
				...siteFilters.hostingEnabled,
			},
			icon: <GitHubIcon width={ 18 } height={ 18 } />,
		},
		{
			name: 'openPHPLogs',
			label: __( 'Open PHP logs' ),
			searchLabel: [
				_x( 'open php logs', 'Keyword for the Open PHP logs command' ),
				_x( 'error logs', 'Keyword for the Open PHP logs command' ),
				_x( 'fatal errors', 'Keyword for the Open PHP logs command' ),
				_x( 'php errors', 'Keyword for the Open PHP logs command' ),
				_x( 'php warnings', 'Keyword for the Open PHP logs command' ),
			].join( ' ' ),
			callback: setStateCallback( 'openPHPLogs', __( 'Select site to open PHP logs' ) ),
			siteFunctions: {
				onClick: ( param ) =>
					commandNavigation( `/site-monitoring/${ param.site.slug }/php` )( param ),
				...siteFilters.hostingEnabled,
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openWebServerLogs',
			label: __( 'Open web server logs' ),
			searchLabel: [
				_x( 'open web server logs', 'Keyword for the Open web server logs command' ),
				_x( 'access logs', 'Keyword for the Open web server logs command' ),
				_x( 'apache logs', 'Keyword for the Open web server logs command' ),
				_x( 'nginx logs', 'Keyword for the Open web server logs command' ),
				_x( 'request logs', 'Keyword for the Open web server logs command' ),
			].join( ' ' ),
			callback: setStateCallback(
				'openWebServerLogs',
				__( 'Select site to open web server logs' )
			),
			siteFunctions: {
				onClick: ( param ) =>
					commandNavigation( `/site-monitoring/${ param.site.slug }/web` )( param ),
				...siteFilters.hostingEnabled,
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'manageStagingSites',
			label: __( 'Manage staging sites' ),
			context: [ '/hosting-config' ],
			searchLabel: [
				_x( 'manage staging sites', 'Keyword for the Manage staging sites command' ),
				_x( 'add staging site', 'Keyword for the Manage staging sites command' ),
				_x( 'create staging site', 'Keyword for the Manage staging sites command' ),
				_x( 'delete staging site', 'Keyword for the Manage staging sites command' ),
				_x( 'sync staging site', 'Keyword for the Manage staging sites command' ),
			].join( ' ' ),
			callback: setStateCallback(
				'manageStagingSites',
				__( 'Select site to manage staging sites' )
			),
			siteFunctions: {
				onClick: ( param ) => {
					const targetPath = `/hosting-config/${ param.site.slug }#staging-site`;
					navigateWithinSamePage( targetPath, 'staging-site', param );
				},
				...siteFilters.hostingEnabled,
			},
			icon: toolIcon,
		},
		{
			name: 'changePHPVersion',
			label: __( 'Change PHP version' ),
			callback: setStateCallback( 'changePHPVersion', __( 'Select site to change PHP version' ) ),
			siteFunctions: {
				onClick: ( param ) => {
					const targetPath = `/hosting-config/${ param.site.slug }#web-server-settings`;
					navigateWithinSamePage( targetPath, 'web-server-settings', param );
				},
				...siteFilters.hostingEnabled,
			},
			icon: toolIcon,
		},
		{
			name: 'changeAdminInterfaceStyle',
			label: __( 'Change admin interface style' ),
			searchLabel: [
				_x(
					'change admin interface style',
					'Keyword for the Change admin interface style command'
				),
				_x( 'wp-admin', 'Keyword for the Change admin interface style command' ),
			].join( ' ' ),
			callback: setStateCallback(
				'changeAdminInterfaceStyle',
				__( 'Select site to change admin interface style' )
			),
			siteFunctions: {
				onClick: ( param ) => {
					const targetPath = `/hosting-config/${ param.site.slug }#admin-interface-style`;
					navigateWithinSamePage( targetPath, 'admin-interface-style', param );
				},
				...siteFilters.hostingEnabled,
			},
			icon: pageIcon,
		},
		{
			name: 'addNewPost',
			label: __( 'Add new post' ),
			searchLabel: [
				_x( 'add new post', 'Keyword for the Add new post command' ),
				_x( 'create post', 'Keyword for the Add new post command' ),
				_x( 'write post', 'Keyword for the Add new post command' ),
			].join( ' ' ),
			context: [ '/posts' ],
			callback: setStateCallback( 'addNewPost', __( 'Select site to add new post' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.EDIT_POSTS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/post',
						wpAdmin: '/post-new.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: plusIcon,
		},
		{
			name: 'managePosts',
			label: __( 'Manage posts' ),
			searchLabel: [
				_x( 'manage posts', 'Keyword for the Manage posts command' ),
				_x( 'edit posts', 'Keyword for the Manage posts command' ),
			].join( ' ' ),
			callback: setStateCallback( 'managePosts', __( 'Select site to manage posts' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.EDIT_POSTS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/posts',
						wpAdmin: '/edit.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: editIcon,
		},
		{
			name: 'viewMediaUploads',
			label: __( 'View media uploads' ),
			searchLabel: [
				_x( 'view media uploads', 'Keyword for the View media uploads command' ),
				_x( 'manage uploads', 'Keyword for the View media uploads command' ),
			].join( ' ' ),
			callback: setStateCallback( 'viewMediaUploads', __( 'Select site to view media uploads' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.UPLOAD_FILES,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/media',
						wpAdmin: '/upload.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: mediaIcon,
		},
		{
			name: 'uploadMedia',
			label: __( 'Upload media' ),
			callback: setStateCallback( 'uploadMedia', __( 'Select site to upload media' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.UPLOAD_FILES,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/media',
						wpAdmin: '/media-new.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: mediaIcon,
		},
		{
			name: 'managePages',
			label: __( 'Manage pages' ),
			searchLabel: [
				_x( 'manage pages', 'Keyword for the Manage pages command' ),
				_x( 'edit pages', 'Keyword for the Manage pages command' ),
				_x( 'delete pages', 'Keyword for the Manage pages command' ),
			].join( ' ' ),
			callback: setStateCallback( 'managePages', __( 'Select site to manage pages' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.EDIT_PAGES,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/pages',
						wpAdmin: '/edit.php?post_type=page',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: editIcon,
		},
		{
			name: 'addNewPage',
			label: __( 'Add new page' ),
			searchLabel: [
				_x( 'add new page', 'Keyword for the Add new page command' ),
				_x( 'create page', 'Keyword for the Add new page command' ),
				_x( 'write page', 'Keyword for the Add new page command' ),
			].join( ' ' ),
			context: [ '/pages' ],
			callback: setStateCallback( 'addNewPage', __( 'Select site to add new page' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.EDIT_PAGES,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/page',
						wpAdmin: '/post-new.php?post_type=page',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: plusIcon,
		},
		{
			name: 'manageComments',
			label: __( 'Manage comments' ),
			searchLabel: [
				_x( 'manage comments', 'Keyword for the Manage comments command' ),
				_x( 'edit comments', 'Keyword for the Manage comments command' ),
				_x( 'delete comments', 'Keyword for the Manage comments command' ),
			].join( ' ' ),
			callback: setStateCallback( 'manageComments', __( 'Select site to manage comments' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MODERATE_COMMENTS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/comments',
						wpAdmin: '/edit-comments.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: postCommentsIcon,
		},
		{
			name: 'manageThemes',
			label: __( 'Manage themes' ),
			searchLabel: [
				_x( 'manage themes', 'Keyword for the Manage themes command' ),
				_x( 'activate theme', 'Keyword for the Manage themes command' ),
				_x( 'install theme', 'Keyword for the Manage themes command' ),
				_x( 'delete theme', 'Keyword for the Manage themes command' ),
			].join( ' ' ),
			callback: setStateCallback( 'manageThemes', __( 'Select site to manage themes' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.EDIT_THEME_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/themes',
						wpAdmin: '/themes.php',
					} );
					commandNavigation( link )( param );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ),
			},
			icon: brushIcon,
		},
		{
			name: 'installTheme',
			label: __( 'Install theme' ),
			searchLabel: [
				_x( 'install theme', 'Keyword for the Install theme command' ),
				_x( 'add theme', 'Keyword for the Install theme command' ),
				_x( 'upload theme', 'Keyword for the Install theme command' ),
			].join( ' ' ),
			callback: setStateCallback( 'installTheme', __( 'Select site to install theme' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.EDIT_THEME_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/themes',
						wpAdmin: '/theme-install.php',
					} );
					commandNavigation( link )( param );
				},
				filter: ( site: SiteExcerptData ) => site?.jetpack,
			},
			icon: brushIcon,
		},
		{
			name: 'managePlugins',
			label: __( 'Manage plugins' ),
			searchLabel: [
				_x( 'manage plugins', 'Keyword for the Manage plugins command' ),
				_x( 'activate plugin', 'Keyword for the Manage plugins command' ),
				_x( 'deactivate plugin', 'Keyword for the Manage plugins command' ),
				_x( 'install plugin', 'Keyword for the Manage plugins command' ),
				_x( 'delete plugin', 'Keyword for the Manage plugins command' ),
				_x( 'update plugin', 'Keyword for the Manage plugins command' ),
			].join( ' ' ),
			callback: setStateCallback( 'managePlugins', __( 'Select site to manage plugins' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.ACTIVATE_PLUGINS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/plugins',
						wpAdmin: '/plugins.php',
					} );
					commandNavigation( link )( param );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ),
			},
			icon: pluginsIcon,
		},
		{
			name: 'installPlugin',
			label: __( 'Install plugin' ),
			searchLabel: [
				_x( 'install plugin', 'Keyword for the Install plugin command' ),
				_x( 'add plugin', 'Keyword for the Install plugin command' ),
				_x( 'upload plugin', 'Keyword for the Install plugin command' ),
			].join( ' ' ),
			callback: setStateCallback( 'installPlugin', __( 'Select site to install plugin' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.ACTIVATE_PLUGINS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/plugins',
						wpAdmin: '/plugin-install.php',
					} );
					commandNavigation( link )( param );
				},
				filter: ( site: SiteExcerptData ) => site?.jetpack,
			},
			icon: pluginsIcon,
		},
		{
			name: 'changePlan',
			label: __( 'Change site plan' ),
			searchLabel: [
				_x( 'upgrade plan', 'Keyword for the Change site plan command' ),
				_x( 'change plan', 'Keyword for the Change site plan command' ),
				_x( 'add plan', 'Keyword for the Change site plan command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'changePlan', __( 'Select site to change plan' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => commandNavigation( `/plans/${ param.site.slug }` )( param ),
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! site?.is_wpcom_staging_site,
			},
			icon: creditCardIcon,
		},
		{
			name: 'manageMyPlan',
			label: __( 'Manage site plan' ),
			searchLabel: [
				_x( 'upgrade plan', 'Keyword for the Manage site plan command' ),
				_x( 'manage plan', 'Keyword for the Manage site plan command' ),
				_x( 'plan features', 'Keyword for the Manage site plan command' ),
			].join( ' ' ),
			callback: setStateCallback( 'manageMyPlan', __( 'Select site to manage your plan' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => commandNavigation( `/plans/my-plan/${ param.site.slug }` )( param ),
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! site?.is_wpcom_staging_site,
			},
			icon: creditCardIcon,
		},
		{
			name: 'manageUsers',
			label: __( 'Manage users' ),
			searchLabel: [
				_x( 'manage users', 'Keyword for the Manage users command' ),
				_x( 'add user', 'Keyword for the Manage users command' ),
				_x( 'delete user', 'Keyword for the Manage users command' ),
				_x( 'edit user', 'Keyword for the Manage users command' ),
				_x( 'remove user', 'Keyword for the Manage users command' ),
				_x( 'update user', 'Keyword for the Manage users command' ),
			].join( ' ' ),
			callback: setStateCallback( 'manageUsers', __( 'Select site to manage users' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.LIST_USERS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/people/team',
						wpAdmin: '/users.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: peopleIcon,
		},
		{
			name: 'addNewUser',
			label: __( 'Add new user' ),
			searchLabel: [
				_x( 'add new user', 'Keyword for the Add new user command' ),
				_x( 'create user', 'Keyword for the Add new user command' ),
				_x( 'invite user', 'Keyword for the Add new user command' ),
			].join( ' ' ),
			callback: setStateCallback( 'addNewUser', __( 'Select site to add new user' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.LIST_USERS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/people/new',
						wpAdmin: '/user-new.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: peopleIcon,
		},
		{
			name: 'addSubscribers',
			label: __( 'Add subscribers' ),
			searchLabel: [
				_x( 'add subscribers', 'Keyword for the Add subscribers command' ),
				_x( 'import subscribers', 'Keyword for the Add subscribers command' ),
				_x( 'upload subscribers', 'Keyword for the Add subscribers command' ),
			].join( ' ' ),
			context: [ '/subscribers' ],
			callback: setStateCallback( 'addSubscribers', __( 'Select site to add subscribers' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) =>
					commandNavigation( `/subscribers/${ param.site.slug }#add-subscribers` )( param ),
			},
			icon: subscriberIcon,
		},
		{
			name: 'manageSubscribers',
			label: __( 'Manage subscribers' ),
			callback: setStateCallback( 'manageSubscribers', __( 'Select site to manage subscribers' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => commandNavigation( `/subscribers/${ param.site.slug }` )( param ),
			},
			icon: subscriberIcon,
		},
		{
			name: 'downloadSubscribers',
			label: __( 'Download subscribers as CSV' ),
			context: [ '/subscribers' ],
			callback: setStateCallback(
				'downloadSubscribers',
				__( 'Select site to download subscribers' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( { site, close } ) => {
					close();
					window.location.assign(
						`https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=${ site.ID }&blog_subscribers=csv&type=all`
					);
				},
			},
			icon: downloadIcon,
		},
		{
			name: 'import',
			label: __( 'Import content to the site' ),
			context: [ '/posts' ],
			callback: setStateCallback( 'import', __( 'Select site to import content' ) ),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => commandNavigation( `/import/${ param.site.slug }` )( param ),
			},
			icon: downloadIcon,
		},
		{
			name: 'openWooCommerceSettings',
			label: __( 'Open WooCommerce settings' ),
			callback: setStateCallback(
				'openWooCommerceSettings',
				__( 'Select site to open WooCommerce settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => {
					if ( param.site.options?.is_wpcom_store ) {
						commandNavigation( `${ param.site.URL }/wp-admin/admin.php?page=wc-admin` )( param );
					} else {
						commandNavigation( `/woocommerce-installation/${ param.site.slug }` )( param );
					}
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites hosted on WordPress.com.' ),
			},
			icon: <WooCommerceLogo size={ 24 } className="woo-command-palette" />,
		},
		{
			name: 'manageSettingsGeneral',
			label: __( 'Manage general settings' ),
			context: [ '/settings' ],
			callback: setStateCallback(
				'manageSettingsGeneral',
				__( 'Select site to manage general settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/settings/general',
						wpAdmin: '/options-general.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsWriting',
			label: __( 'Manage writing settings' ),
			context: [ '/settings' ],
			callback: setStateCallback(
				'manageSettingsWriting',
				__( 'Select site to manage writing settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/settings/writing',
						wpAdmin: '/options-writing.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsReading',
			label: __( 'Manage reading settings' ),
			context: [ '/settings' ],
			callback: setStateCallback(
				'manageSettingsReading',
				__( 'Select site to manage reading settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/settings/reading',
						wpAdmin: '/options-reading.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsDiscussion',
			label: __( 'Manage discussion settings' ),
			context: [ '/settings' ],
			callback: setStateCallback(
				'manageSettingsDiscussion',
				__( 'Select site to manage discussion settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/settings/discussion',
						wpAdmin: '/options-discussion.php',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsNewsletter',
			label: __( 'Manage newsletter settings' ),
			context: [ '/settings' ],
			callback: setStateCallback(
				'manageSettingsNewsletter',
				__( 'Select site to manage newsletter settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => {
					const link = generateSiteInterfaceLink( param.site, {
						calypso: '/settings/newsletter',
						wpAdmin: '/admin.php?page=jetpack#/newsletter',
					} );
					commandNavigation( link )( param );
				},
			},
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsPodcast',
			label: __( 'Manage podcast settings' ),
			context: [ '/settings' ],
			callback: setStateCallback(
				'manageSettingsPodcast',
				__( 'Select site to manage podcast settings' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) =>
					commandNavigation( `/settings/podcasting/${ param.site.slug }` )( param ),
			},
			icon: settingsIcon,
		},
		{
			name: 'sendFeedback',
			label: __( 'Send feedback' ),
			searchLabel: _x( 'suggest command', 'Keyword for the Send feedback command' ),
			callback: ( { close }: { close: () => void } ) => {
				close();
				setInitialRoute( emailUrl );
				setShowHelpCenter( true );
			},
			icon: feedbackIcon,
		},
	];*/

	return commands;
};
