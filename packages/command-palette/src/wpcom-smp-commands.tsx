import { recordTracksEvent } from '@automattic/calypso-analytics';
/*import { Gridicon, JetpackLogo } from '@automattic/components';
import { SiteCapabilities } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from 'packages/help-center/src/stores';
import styled from '@emotion/styled';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';*/
import {
	/*alignJustify as acitvityLogIcon,
	backup as backupIcon,
	brush as brushIcon,
	chartBar as statsIcon,
	code as codeIcon,
	commentAuthorAvatar as profileIcon,
	commentAuthorName as subscriberIcon,
	download as downloadIcon,
	edit as editIcon,
	globe as domainsIcon,
	seen as seenIcon,
	home as dashboardIcon,
	key as keyIcon,
	media as mediaIcon,
	page as pageIcon,
	payment as creditCardIcon,
	people as peopleIcon,
	plugins as pluginsIcon,
	plus as plusIcon,
	postComments as postCommentsIcon,
	settings as settingsIcon,
	tool as toolIcon,*/
	wordpress as wordpressIcon,
	/*reusableBlock as cacheIcon,
	help as helpIcon,
	comment as feedbackIcon,*/
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
/*import request from 'wpcom-proxy-request';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useOpenPhpMyAdmin } from 'calypso/my-sites/hosting/phpmyadmin-card/index.js';
import { useDispatch } from 'calypso/state';
import { clearWordPressCache } from 'client/state/hosting/actions.js';
import { NoticeStatus } from 'client/state/notices/types';
import { SiteExcerptData } from './site-excerpt-types';
import {
	EDGE_CACHE_ENABLE_DISABLE_NOTICE_ID,
	getEdgeCacheStatus,
	useSetEdgeCacheMutation,
	purgeEdgeCache,
} from './use-cache';*/
import { Command, CommandCallBackParams } from './use-command-palette';
//import { generateSiteInterfaceLink, isCustomDomain, isNotAtomicJetpack, isP2Site } from './utils';

/*const WooCommerceLogo = styled.svg`
	margin: 0 auto 20px;
	path {
		fill: var( --studio-black );
	}
`;*/

interface useCommandNavigationOptions {
	navigate: ( path: string, openInNewTab: boolean ) => void;
}

interface useCommandsArrayWpcomOptions {
	setSelectedCommandName: ( name: string ) => void;
	navigate: ( path: string, openInNewTab: boolean ) => void;
}

function useCommandNavigation( { navigate }: useCommandNavigationOptions ) {
	// TODO: Find an alternative way to use the current route.
	//const currentRoute = useSelector( getCurrentRoutePattern );
	const currentRoute = window.location.pathname;
	// Callback to navigate to a command's destination
	// used on command callback or siteFunctions onClick
	const commandNavigation = useCallback(
		( url: string, { openInNewTab = false } = {} ) =>
			( { close, command }: Pick< CommandCallBackParams, 'close' | 'command' > ) => {
				recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
					command: command.name,
					current_route: currentRoute,
					is_wp_admin: url.includes( '/wp-admin' ),
				} );
				close();
				navigate( url, openInNewTab );
			},
		[ navigate, currentRoute ]
	);
	return commandNavigation;
}

export const useCommandsArrayWpcom = ( {
	setSelectedCommandName,
	navigate,
	/*createNotice,
	removeNotice,*/
}: useCommandsArrayWpcomOptions ) => {
	const { __, _x } = useI18n();
	const setStateCallback =
		( actionName: string, placeholder: string = __( 'Select a site' ) ) =>
		( { setSearch, setPlaceholderOverride }: CommandCallBackParams ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
			setPlaceholderOverride( placeholder );
		};

	const commandNavigation = useCommandNavigation( { navigate } );
	/*const dispatch = useDispatch();

	const { setEdgeCache } = useSetEdgeCacheMutation( {}, createNotice );

	const displayNotice = (
		message: string,
		noticeType: NoticeStatus = 'is-success',
		duration: undefined | number | null = 5000,
		additionalOptions: { button?: string; id?: string; onClick?: () => void } = {}
	) => {
		const { notice } = createNotice( noticeType, message, { duration, ...additionalOptions } );
		return {
			removeNotice: () => removeNotice( notice.noticeId ),
		};
	};
	const createSiteUrl = useAddNewSiteUrl( {
		ref: 'command-palette',
	} );

	const siteFilters = {
		hostingEnabled: {
			capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
			filter: ( site: SiteExcerptData ) => {
				return site?.is_wpcom_atomic;
			},
			filterNotice: __( 'Only listing sites with hosting features enabled.' ),
			emptyListNotice: __( 'No sites with hosting features enabled.' ),
		},
		hostingEnabledAndPublic: {
			capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
			filter: ( site: SiteExcerptData ) =>
				site?.is_wpcom_atomic && ! site?.is_coming_soon && ! site?.is_private,
			filterNotice: __( 'Only listing public sites with hosting features enabled.' ),
			emptyListNotice: __( 'No public sites with hosting features enabled.' ),
		},
	};

	const fetchSshUser = async ( siteId: number ) => {
		const response = await request( {
			path: `/sites/${ siteId }/hosting/ssh-users`,
			apiNamespace: 'wpcom/v2',
			apiVersion: '2',
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

		const response = await request( {
			path: `/sites/${ siteId }/hosting/ssh-user/${ sshUser }/reset-password`,
			apiNamespace: 'wpcom/v2',
			apiVersion: '2',
			method: 'POST',
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
	} ).toString() }`;*/

	const commands: Command[] = [
		{
			name: 'viewMySites',
			label: __( 'View my sites' ),
			searchLabel: [
				_x( 'view my sites', 'Keyword for the View my sites command' ),
				_x( 'manage sites', 'Keyword for the View my sites command' ),
				_x( 'sites dashboard', 'Keyword for the View my sites command' ),
			].join( ' ' ),
			callback: commandNavigation( `/sites` ),
			icon: wordpressIcon,
		},
		/*{
			name: 'getHelp',
			label: __( 'Get help' ),
			searchLabel: [
				_x( 'get help', 'Keyword for the Get help command' ),
				_x( 'contact support', 'Keyword for the Get help command' ),
				_x( 'help center', 'Keyword for the Get help command' ),
			].join( ' ' ),
			callback: ( { close }: { close: () => void } ) => {
				close();
				setShowHelpCenter( true );
			},
			icon: helpIcon,
		},
		{
			name: 'clearCache',
			label: __( 'Clear cache' ),
			callback: setStateCallback( 'clearCache', __( 'Select a site to clear cache' ) ),
			siteFunctions: {
				onClick: ( { site, close } ) => {
					close();
					clearEdgeCache( site.ID );
				},
				...siteFilters.hostingEnabled,
			},
			icon: cacheIcon,
		},
		{
			name: 'enableEdgeCache',
			label: __( 'Enable edge cache' ),
			callback: setStateCallback( 'enableEdgeCache', __( 'Select a site to enable edge cache' ) ),
			siteFunctions: {
				onClick: ( { site, close } ) => {
					close();
					enableEdgeCache( site.ID );
				},
				...siteFilters.hostingEnabledAndPublic,
			},
			icon: cacheIcon,
		},
		{
			name: 'disableEdgeCache',
			label: __( 'Disable edge cache' ),
			callback: setStateCallback( 'disableEdgeCache', __( 'Select a site to disable edge cache' ) ),
			siteFunctions: {
				onClick: ( { site, close } ) => {
					close();
					disableEdgeCache( site.ID );
				},
				...siteFilters.hostingEnabledAndPublic,
			},
			icon: cacheIcon,
		},
		{
			name: 'manageCacheSettings',
			label: __( 'Manage cache settings' ),
			searchLabel: [
				_x( 'manage cache settings', 'Keyword for the Manage cache settings command' ),
				_x( 'clear cache', 'Keyword for the Manage cache settings command' ),
				_x( 'disable cache', 'Keyword for the Manage cache settings command' ),
				_x( 'enable cache', 'Keyword for the Manage cache settings command' ),
				_x( 'global edge cache', 'Keyword for the Manage cache settings command' ),
				_x( 'purge cache', 'Keyword for the Manage cache settings command' ),
			].join( ' ' ),
			callback: setStateCallback(
				'manageCacheSettings',
				__( 'Select site to manage cache settings' )
			),
			siteFunctions: {
				onClick: ( param ) =>
					commandNavigation( `/hosting-config/${ param.site.slug }#cache` )( param ),
				...siteFilters.hostingEnabled,
			},
			icon: cacheIcon,
		},
		{
			name: 'visitSite',
			label: __( 'Visit site homepage' ),
			searchLabel: [
				_x( 'visit site homepage', 'Keyword for the Visit site dashboard command' ),
				_x( 'visit site', 'Keyword for the Visit site dashboard command' ),
				_x( 'see site', 'Keyword for the Visit site dashboard command' ),
				_x( 'browse site', 'Keyword for the Visit site dashboard command' ),
			].join( ' ' ),
			context: [ '/:site' ],
			callback: setStateCallback( 'visitSite', __( 'Select site to visit the homepage' ) ),
			siteFunctions: {
				onClick: ( param ) => commandNavigation( param.site.URL, { openInNewTab: true } )( param ),
			},
			icon: seenIcon,
		},
		{
			name: 'openSiteDashboard',
			label: __( 'Open site dashboard' ),
			searchLabel: [
				_x( 'open site dashboard', 'Keyword for the Open site dashboard command' ),
				_x( 'admin', 'Keyword for the Open site dashboard command' ),
				_x( 'wp-admin', 'Keyword for the Open site dashboard command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'openSiteDashboard', __( 'Select site to open dashboard' ) ),
			siteFunctions: {
				onClick: ( param ) => commandNavigation( `/home/${ param.site.slug }` )( param ),
			},
			icon: dashboardIcon,
		},
		{
			name: 'openHostingConfiguration',
			label: __( 'Open hosting configuration' ),
			searchLabel: [
				_x( 'open hosting configuration', 'Keyword for the Open hosting configuration command' ),
				_x( 'admin interface style', 'Keyword for the Open hosting configuration command' ),
				_x( 'cache', 'Keyword for the Open hosting configuration command' ),
				_x( 'database', 'Keyword for the Open hosting configuration command' ),
				_x( 'global edge cache', 'Keyword for the Open hosting configuration command' ),
				_x( 'hosting', 'Keyword for the Open hosting configuration command' ),
				_x( 'mysql', 'Keyword for the Open hosting configuration command' ),
				_x( 'phpmyadmin', 'Keyword for the Open hosting configuration command' ),
				_x( 'php version', 'Keyword for the Open hosting configuration command' ),
				_x( 'sftp/ssh credentials', 'Keyword for the Open hosting configuration command' ),
				_x( 'wp-cli', 'Keyword for the Open hosting configuration command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback(
				'openHostingConfiguration',
				__( 'Select site to open hosting configuration' )
			),
			siteFunctions: {
				capabilityFilter: SiteCapabilities.MANAGE_OPTIONS,
				onClick: ( param ) => commandNavigation( `/hosting-config/${ param.site.slug }` )( param ),
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
				filterNotice: __( 'Only listing sites hosted on WordPress.com.' ),
			},
			icon: settingsIcon,
		},
		{
			name: 'openPHPmyAdmin',
			label: __( 'Open database in phpMyAdmin' ),
			searchLabel: [
				_x( 'open database in phpmyadmin', 'Keyword for the Open database in phpMyAdmin command' ),
				_x( 'database', 'Keyword for the Open database in phpMyAdmin command' ),
				_x( 'mysql', 'Keyword for the Open database in phpMyAdmin command' ),
				_x( 'phpmyadmin', 'Keyword for the Open database in phpMyAdmin command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'openPHPmyAdmin', __( 'Select site to open phpMyAdmin' ) ),
			siteFunctions: {
				onClick: async ( { site, close } ) => {
					close();
					await openPhpMyAdmin( site.ID );
				},
				...siteFilters.hostingEnabled,
			},
			icon: pageIcon,
		},
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
			icon: <Gridicon icon="reader" />,
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
				onClick: ( param ) => commandNavigation( `/hosting-config/${ param.site.slug }` )( param ),
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
				onClick: ( param ) => commandNavigation( `/stats/${ param.site.slug }` )( param ),
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
				onClick: ( param ) => commandNavigation( `/activity-log/${ param.site.slug }` )( param ),
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
				onClick: ( param ) => commandNavigation( `/backup/${ param.site.slug }` )( param ),
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
				onClick: ( param ) =>
					commandNavigation( `/hosting-config/${ param.site.slug }#staging-site` )( param ),
				...siteFilters.hostingEnabled,
			},
			icon: toolIcon,
		},
		{
			name: 'changePHPVersion',
			label: __( 'Change PHP version' ),
			callback: setStateCallback( 'changePHPVersion', __( 'Select site to change PHP version' ) ),
			siteFunctions: {
				onClick: ( param ) =>
					commandNavigation( `/hosting-config/${ param.site.slug }#web-server-settings` )( param ),
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
				onClick: ( param ) =>
					commandNavigation( `/hosting-config/${ param.site.slug }#admin-interface-style` )(
						param
					),
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
			icon: (
				<WooCommerceLogo width={ 24 } viewBox="0 0 72 43">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M65.2989 0H6.72025C3.00794 0 0 3.00794 0 6.70123V29.0514C0 32.7447 3.00794 35.7527 6.70123 35.7527H34.4581L47.1562 42.8157L44.2816 35.7527H65.2989C68.9921 35.7527 72 32.7447 72 29.0514V6.70123C72 3.00794 68.9921 0 65.2989 0ZM5.48284 5.15918C4.75944 5.17828 4.09311 5.52096 3.63615 6.07302C3.1983 6.64417 3.02696 7.36757 3.17928 8.09104C4.91169 19.1328 6.52989 26.5765 8.0339 30.4221C8.58596 31.831 9.27131 32.4972 10.0709 32.4402C11.2893 32.345 12.7742 30.6506 14.5067 27.319C14.892 26.5485 15.3617 25.6123 15.9132 24.5131L15.9134 24.5126L15.9163 24.5068C16.6995 22.9459 17.6473 21.0569 18.7521 18.8473C20.3513 24.3872 22.5215 28.5564 25.263 31.355C26.0435 32.1355 26.805 32.4972 27.5855 32.4402C28.2519 32.402 28.8611 31.9832 29.1466 31.374C29.4321 30.7838 29.5654 30.1176 29.4893 29.4512C29.2989 26.767 29.5845 23.0165 30.3079 18.2381C31.0504 13.2883 32.0022 9.74729 33.1445 7.61506C33.3729 7.19623 33.4682 6.70123 33.4301 6.20631C33.392 5.53998 33.0684 4.91169 32.5353 4.51195C32.0213 4.07409 31.355 3.86463 30.6887 3.92177C29.851 3.95981 29.1086 4.45481 28.7469 5.21632C26.9382 8.54792 25.6437 13.9546 24.8631 21.4173C23.6257 18.1619 22.6929 14.7923 22.0837 11.3655C21.76 9.61399 20.9605 8.79541 19.6659 8.89059C18.7711 8.94773 18.0477 9.53783 17.4575 10.642L11.0037 22.9023C9.95667 18.6188 8.96675 13.4025 8.05292 7.27239C7.82444 5.76838 6.96775 5.064 5.48284 5.15918ZM48.4319 10.6992C47.442 8.92863 45.7286 7.67213 43.7296 7.29141C43.1965 7.17721 42.6635 7.12007 42.1305 7.12007C39.3129 7.12007 37.0093 8.58596 35.2198 11.5177C33.6967 14.0117 32.8972 16.8864 32.9353 19.7991C32.9353 22.0646 33.4112 24.0064 34.3441 25.6247C35.3341 27.3952 37.0474 28.6516 39.0464 29.0324C39.5794 29.1466 40.1124 29.2037 40.6456 29.2037C43.4822 29.2037 45.7857 27.7379 47.5562 24.806C49.0792 22.2931 49.8787 19.4184 49.8407 16.4675C49.8407 14.2021 49.3647 12.2793 48.4319 10.6992ZM44.7196 18.8663C44.3198 20.7891 43.5773 22.2359 42.4731 23.2259C41.6164 24.0064 40.8169 24.3111 40.0934 24.1778C39.37 24.0445 38.7989 23.3972 38.361 22.274C38.0374 21.4173 37.847 20.5225 37.847 19.5897C37.847 18.8663 37.9231 18.1429 38.0564 17.4384C38.342 16.182 38.856 15.0017 39.6175 13.9355C40.5884 12.5077 41.6164 11.8985 42.6825 12.1269C43.406 12.2793 43.9771 12.9075 44.415 14.0308C44.7386 14.8875 44.929 15.7822 44.929 16.696C44.929 17.4194 44.8719 18.1429 44.7196 18.8663ZM62.1578 7.29141C64.1569 7.67213 65.8703 8.92863 66.8598 10.6992C67.7931 12.2793 68.2691 14.2021 68.2691 16.4675C68.3068 19.4184 67.5075 22.2931 65.9843 24.806C64.2139 27.7379 61.9106 29.2037 59.0737 29.2037C58.5409 29.2037 58.008 29.1466 57.4743 29.0324C55.476 28.6516 53.7623 27.3952 52.7723 25.6247C51.8395 24.0064 51.3636 22.0646 51.3636 19.7991C51.3255 16.8864 52.1251 14.0117 53.648 11.5177C55.4375 8.58596 57.7415 7.12007 60.5584 7.12007C61.0921 7.12007 61.625 7.17721 62.1578 7.29141ZM60.9011 23.2259C62.0054 22.2359 62.7477 20.7891 63.1481 18.8663C63.2998 18.1429 63.3576 17.4194 63.3576 16.696C63.3576 15.7822 63.1666 14.8875 62.8432 14.0308C62.405 12.9075 61.8344 12.2793 61.1106 12.1269C60.0448 11.8985 59.0168 12.5077 58.0457 13.9355C57.2841 15.0017 56.7705 16.182 56.4848 17.4384C56.3516 18.1429 56.2753 18.8663 56.2753 19.5897C56.2753 20.5225 56.4655 21.4173 56.789 22.274C57.2271 23.3972 57.7985 24.0445 58.5216 24.1778C59.2455 24.3111 60.0448 24.0064 60.9011 23.2259Z"
					/>
				</WooCommerceLogo>
			),
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
				onClick: ( param ) =>
					commandNavigation( `/settings/newsletter/${ param.site.slug }` )( param ),
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
		},*/
	];

	return commands;
};
