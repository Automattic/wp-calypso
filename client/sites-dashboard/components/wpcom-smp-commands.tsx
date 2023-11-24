import {
	alignJustify as acitvityLogIcon,
	backup as backupIcon,
	chartBar as statsIcon,
	cog as hostingConfigIcon,
	commentAuthorAvatar as profileIcon,
	commentAuthorName as subscriberIcon,
	download as downloadIcon,
	upload as uploadIcon,
	globe as domainsIcon,
	home as dashboardIcon,
	key as keyIcon,
	page as pageIcon,
	payment as creditCardIcon,
	plus as addNewSiteIcon,
	post as postIcon,
	postComments as postCommentsIcon,
	settings as accountSettingsIcon,
	tool as toolIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { CommandCallBackParams } from 'calypso/components/command-pallette/use-command-pallette';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { navigate } from 'calypso/lib/navigate';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import wpcom from 'calypso/lib/wp';
import { useOpenPhpMyAdmin } from 'calypso/my-sites/hosting/phpmyadmin-card';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { isCustomDomain, isNotAtomicJetpack, isP2Site } from '../utils';

interface useCommandsArrayWpcomOptions {
	setSelectedCommandName: ( name: string ) => void;
}

export const useCommandsArrayWpcom = ( {
	setSelectedCommandName,
}: useCommandsArrayWpcomOptions ) => {
	const translate = useTranslate();
	const setStateCallback =
		( actionName: string ) =>
		( { setSearch, setPlaceholderOverride }: CommandCallBackParams ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
			setPlaceholderOverride( translate( 'Select a site' ) );
		};

	const { __ } = useI18n();
	const dispatch = useDispatch();
	const displaySuccessNotice = ( message: string ) =>
		dispatch( successNotice( message, { duration: 5000 } ) );
	const createSiteUrl = useAddNewSiteUrl( {
		source: 'sites-dashboard-command-palette',
		ref: 'topbar',
	} );

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
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		const textToCopy = copyType === 'username' ? sshUser : `ssh ${ sshUser }@sftp.wp.com`;
		navigator.clipboard.writeText( textToCopy );
		const successMessage =
			copyType === 'username' ? __( 'Copied username' ) : __( 'Copied SSH connection string' );
		displaySuccessNotice( successMessage );
	};

	const resetSshSftpPassword = async ( siteId: number, siteSlug: string ) => {
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		const response = await wpcom.req.post( {
			path: `/sites/${ siteId }/hosting/ssh-user/${ sshUser }/reset-password`,
			apiNamespace: 'wpcom/v2',
			body: {},
		} );
		const sshPassword = response?.password;

		if ( ! sshPassword ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		navigator.clipboard.writeText( sshPassword );
		displaySuccessNotice( __( 'Copied new password' ) );
	};

	const { openPhpMyAdmin } = useOpenPhpMyAdmin();

	const downloadSubscribersForSite = async ( slug: string, siteId: number ) => {
		const url = `https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=${ siteId }&blog_subscribers=csv&type=all`;
		window.open( url );
		const link = document.createElement( 'a' );
		link.href = url;
		link.setAttribute(
			'download',
			`subscribers-${ slug.replace( '.', '-' ) }-${ new Date().toJSON().slice( 0, 10 ) }.csv`
		);
		link.click();
		window.URL.revokeObjectURL( url );
	};

	const commands = [
		{
			name: 'openSiteDashboard',
			label: __( 'Open site dashboard' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'openSiteDashboard' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/home/${ site.slug }` );
				},
			},
			icon: dashboardIcon,
		},
		{
			name: 'manageHostingConfiguration',
			label: __( 'Manage hosting configuration' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'manageHostingConfiguration' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#sftp-credentials` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
			},
			icon: hostingConfigIcon,
		},
		{
			name: 'openPHPmyAdmin',
			label: __( 'Open database in phpMyAdmin' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'openPHPmyAdmin' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					await openPhpMyAdmin( site.ID );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: pageIcon,
		},
		{
			name: 'openProfile',
			label: __( 'Open my profile' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me` );
			},
			icon: profileIcon,
		},
		{
			name: 'openAccountSettings',
			label: __( 'Open account settings' ),
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me/account` );
			},
			icon: accountSettingsIcon,
		},
		{
			name: 'acessPurchases',
			label: __( 'View my purchases' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `me/purchases` );
			},
			icon: creditCardIcon,
		},
		{
			name: 'manageDomains',
			label: __( 'Manage domains' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `domains/manage` );
			},
			icon: domainsIcon,
		},
		{
			name: 'manageDns',
			label: __( 'Manage DNS records' ),
			context: [ '/sites' ],
			callback: setStateCallback( 'manageDns' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/domains/manage/${ site.slug }/dns/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) =>
					isCustomDomain( site.slug ) && ! isNotAtomicJetpack( site ),
			},
			icon: domainsIcon,
		},
		{
			name: 'copySshConnectionString',
			label: __( 'Copy SSH connection string' ),
			callback: setStateCallback( 'copySshConnectionString' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					await copySshSftpDetails( site.ID, 'connectionString', site.slug );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: keyIcon,
		},
		{
			name: 'openSshCredentials',
			label: __( 'Open SFTP/SSH credentials' ),
			callback: setStateCallback( 'openSshCredentials' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: keyIcon,
		},
		{
			name: 'resetSshSftpPassword',
			label: __( 'Reset SSH/SFTP password' ),
			callback: setStateCallback( 'resetSshSftpPassword' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					resetSshSftpPassword( site.ID, site.slug );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: keyIcon,
		},
		{
			name: 'openJetpackStats',
			label: __( 'Open Jetpack stats' ),
			callback: setStateCallback( 'openJetpackStats' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/stats/${ site.slug }` );
				},
			},
			icon: statsIcon,
		},
		{
			name: 'registerDomain',
			label: __( 'Register domain' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/start/domain/domain-only` );
			},
			icon: domainsIcon,
		},
		{
			name: 'openActivityLog',
			label: __( 'Open activity log' ),
			callback: setStateCallback( 'openActivityLog' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/activity-log/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openJetpackBackups',
			label: __( 'Open Jetpack backups' ),
			callback: setStateCallback( 'openJetpackBackups' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/backup/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
			},
			icon: backupIcon,
		},
		{
			name: 'viewSiteMonitoringMetrics',
			label: __( 'View site monitoring metrics' ),
			callback: setStateCallback( 'viewSiteMonitoringMetrics' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/site-monitoring/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: statsIcon,
		},
		{
			name: 'openPHPLogs',
			label: __( 'Open PHP logs' ),
			callback: setStateCallback( 'openPHPLogs' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/site-monitoring/${ site.slug }/php` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openWebServerLogs',
			label: __( 'Open web server logs' ),
			callback: setStateCallback( 'openWebServerLogs' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/site-monitoring/${ site.slug }/web` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'manageStagingSites',
			label: __( 'Manage staging sites' ),
			callback: setStateCallback( 'manageStagingSites' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#staging-site` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: toolIcon,
		},
		{
			name: 'changePHPVersion',
			label: __( 'Change PHP version' ),
			callback: setStateCallback( 'changePHPVersion' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#web-server-settings` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: toolIcon,
		},
		{
			name: 'manageCacheSettings',
			label: __( 'Manage cache settings' ),
			callback: setStateCallback( 'manageCacheSettings' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#cache` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: toolIcon,
		},
		{
			name: 'changeAdminInterfaceStyle',
			label: __( 'Change admin interface style' ),
			callback: setStateCallback( 'changeAdminInterfaceStyle' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#admin-interface-style` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: pageIcon,
		},
		{
			name: 'addNewSite',
			label: __( 'Add new site' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( createSiteUrl );
			},
			icon: addNewSiteIcon,
		},
		{
			name: 'addNewPost',
			label: __( 'Add new post' ),
			searchLabel: __( 'add new post' ),
			callback: setStateCallback( 'addNewPost' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/post/${ site.slug }` );
				},
			},
			icon: postIcon,
		},
		{
			name: 'addNewPostAccessSubscribers',
			label: __( 'Add new subscribers-only post' ),
			searchLabel: __( 'add new subscribers-only post' ),
			callback: setStateCallback( 'addNewPostAccessSubscribers' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/post/${ site.slug }?jetpack_access=subscribers` ); // @TODO: `?jetpack_access=` requires Jetpack PR
				},
			},
			icon: postIcon,
		},
		{
			name: 'addNewPostAccessPaidSubscribers',
			label: __( 'Add new paid subscribers-only post' ),
			searchLabel: __( 'add new paid subscribers-only post' ),
			callback: setStateCallback( 'addNewPostAccessPaidSubscribers' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/post/${ site.slug }?jetpack_access=paid-subscribers` ); // @TODO: `?jetpack_access=` requires Jetpack PR
				},
			},
			icon: postIcon, // TODO: paywall icon
		},
		{
			name: 'manageComments',
			label: __( 'Manage comments' ),
			searchLabel: __( 'manage comments' ),
			callback: setStateCallback( 'manageComments' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/comments/${ site.slug }` );
				},
			},
			icon: postCommentsIcon,
		},
		{
			name: 'addSubscribers',
			label: __( 'Add subscribers' ),
			searchLabel: __( 'add subscribers' ),
			callback: setStateCallback( 'addSubscribers' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/subscribers/${ site.slug }#add-subscribers` );
				},
			},
			icon: subscriberIcon, // TODO: subscribers icon, currently using icon for comments
		},
		{
			name: 'manageSubscribers',
			label: __( 'Manage subscribers' ),
			searchLabel: __( 'manage subscribers' ),
			callback: setStateCallback( 'manageSubscribers' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/subscribers/${ site.slug }` );
				},
			},
			icon: subscriberIcon, // TODO: subscribers icon, currently using icon for comments
		},
		{
			name: 'downloadSubscribers',
			label: __( 'Download subscribers as CSV' ),
			searchLabel: __( 'download subscribers as csv' ),
			callback: setStateCallback( 'downloadSubscribers' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					downloadSubscribersForSite( site.slug, site.ID );
				},
			},
			icon: downloadIcon,
		},
		{
			name: 'import',
			label: __( 'Import content to the site' ),
			searchLabel: __( 'import content to the site' ),
			callback: setStateCallback( 'import' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/import/${ site.slug }` );
				},
			},
			icon: uploadIcon,
		},
	];

	return commands;
};
