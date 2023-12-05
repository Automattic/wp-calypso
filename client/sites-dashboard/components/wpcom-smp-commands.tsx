import { Gridicon, JetpackLogo } from '@automattic/components';
import {
	alignJustify as acitvityLogIcon,
	arrowDown as arrowDownIcon,
	backup as backupIcon,
	brush as brushIcon,
	chartBar as statsIcon,
	cog as settingsIcon,
	commentAuthorAvatar as profileIcon,
	commentAuthorName as subscriberIcon,
	download as downloadIcon,
	edit as editIcon,
	globe as domainsIcon,
	home as dashboardIcon,
	key as keyIcon,
	media as mediaIcon,
	page as pageIcon,
	payment as creditCardIcon,
	people as peopleIcon,
	plugins as pluginsIcon,
	plus as plusIcon,
	postComments as postCommentsIcon,
	settings as accountSettingsIcon,
	tool as toolIcon,
	upload as uploadIcon,
	wordpress as wordpressIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { CommandCallBackParams } from 'calypso/components/command-palette/use-command-palette';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { navigate } from 'calypso/lib/navigate';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import wpcom from 'calypso/lib/wp';
import { useOpenPhpMyAdmin } from 'calypso/my-sites/hosting/phpmyadmin-card';
import { useDispatch } from 'calypso/state';
import { createNotice, removeNotice } from 'calypso/state/notices/actions';
import { NoticeStatus } from 'calypso/state/notices/types';
import { isCustomDomain, isNotAtomicJetpack, isP2Site } from '../utils';

interface useCommandsArrayWpcomOptions {
	setSelectedCommandName: ( name: string ) => void;
}

export const useCommandsArrayWpcom = ( {
	setSelectedCommandName,
}: useCommandsArrayWpcomOptions ) => {
	const { __, _x } = useI18n();
	const setStateCallback =
		( actionName: string, placeholder: string = __( 'Select a site' ) ) =>
		( { setSearch, setPlaceholderOverride }: CommandCallBackParams ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
			setPlaceholderOverride( placeholder );
		};

	const dispatch = useDispatch();
	const displayNotice = (
		message: string,
		noticeType: NoticeStatus = 'is-success',
		duration = 5000
	) => {
		const { notice } = dispatch( createNotice( noticeType, message, { duration } ) );
		return {
			removeNotice: () => dispatch( removeNotice( notice.noticeId ) ),
		};
	};
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
		const loadingMessage =
			copyType === 'username' ? __( 'Copying username…' ) : __( 'Copying SSH connection string…' );
		const { removeNotice: removeLoadingNotice } = displayNotice( loadingMessage, 'is-plain', 5000 );
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			removeLoadingNotice();
			return navigate( `/hosting-config/${ siteSlug }` );
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
			__( 'Resetting SSH/SFTP password…' ),
			'is-plain',
			5000
		);
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
			removeLoadingNotice();
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		navigator.clipboard.writeText( sshPassword );
		removeLoadingNotice();
		displayNotice( __( 'SSH/SFTP password reset and copied to clipboard.' ) );
	};

	const { openPhpMyAdmin } = useOpenPhpMyAdmin();

	const commands = [
		{
			name: 'viewMySites',
			label: __( 'View my sites' ),
			searchLabel: [
				_x( 'view my sites', 'Keyword for the View my sites command' ),
				_x( 'manage sites', 'Keyword for the View my sites command' ),
				_x( 'sites dashboard', 'Keyword for the View my sites command' ),
			].join( ' ' ),
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/sites` );
			},
			icon: wordpressIcon,
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
			searchLabel: [
				_x(
					'manage hosting configuration',
					'Keyword for the Manage hosting configuration command'
				),
				_x( 'admin interface style', 'Keyword for the Manage hosting configuration command' ),
				_x( 'cache', 'Keyword for the Manage hosting configuration command' ),
				_x( 'database', 'Keyword for the Manage hosting configuration command' ),
				_x( 'global edge cache', 'Keyword for the Manage hosting configuration command' ),
				_x( 'hosting', 'Keyword for the Manage hosting configuration command' ),
				_x( 'mysql', 'Keyword for the Manage hosting configuration command' ),
				_x( 'phpmyadmin', 'Keyword for the Manage hosting configuration command' ),
				_x( 'php version', 'Keyword for the Manage hosting configuration command' ),
				_x( 'sftp/ssh credentials', 'Keyword for the Manage hosting configuration command' ),
				_x( 'wp-cli', 'Keyword for the Manage hosting configuration command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: setStateCallback(
				'manageHostingConfiguration',
				__( 'Select site to open hosting configuration' )
			),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#sftp-credentials` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
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
			searchLabel: [
				_x( 'open my profile', 'Keyword for the Open my profile command' ),
				_x( 'account', 'Keyword for the Open my profile command' ),
				_x( 'display name', 'Keyword for the Open my profile command' ),
				_x( 'gravatar', 'Keyword for the Open my profile command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me` );
			},
			icon: profileIcon,
		},
		{
			name: 'openReader',
			label: __( 'Open reader' ),
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/read` );
			},
			icon: <Gridicon icon="reader" />,
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
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/jetpack/connect?cta_from=command-palette` );
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
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/start/import?source=command-palette` );
			},
			icon: arrowDownIcon,
		},
		{
			name: 'addNewSite',
			label: __( 'Add new site' ),
			searchLabel: [
				_x( 'add new site', 'Keyword for the Add new site command' ),
				_x( 'create site', 'Keyword for the Add new site command' ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( createSiteUrl );
			},
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
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me/account` );
			},
			icon: accountSettingsIcon,
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
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `me/purchases` );
			},
			icon: creditCardIcon,
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
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `domains/manage` );
			},
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
			callback: setStateCallback(
				'copySshConnectionString',
				__( 'Select site to copy SSH connection string' )
			),
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
			callback: setStateCallback(
				'openSshCredentials',
				__( 'Select site to open SFTP/SSH credentials' )
			),
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
			label: __( 'Reset SFTP/SSH password' ),
			callback: setStateCallback(
				'resetSshSftpPassword',
				__( 'Select site to reset SFTP/SSH password' )
			),
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
			label: __( 'Open Jetpack Stats' ),
			callback: setStateCallback( 'openJetpackStats', __( 'Select site to open Jetpack Stats' ) ),
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
			callback: setStateCallback( 'openActivityLog', __( 'Select site to open activity log' ) ),
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
			name: 'openJetpackBackup',
			label: __( 'Open Jetpack Backup' ),
			callback: setStateCallback( 'openJetpackBackup', __( 'Select site to open Jetpack Backup' ) ),
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
			callback: setStateCallback(
				'viewSiteMonitoringMetrics',
				__( 'Select site to view monitoring metrics' )
			),
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
			searchLabel: [
				_x( 'open php logs', 'Keyword for the Open PHP logs command' ),
				_x( 'error logs', 'Keyword for the Open PHP logs command' ),
				_x( 'fatal errors', 'Keyword for the Open PHP logs command' ),
				_x( 'php errors', 'Keyword for the Open PHP logs command' ),
				_x( 'php warnings', 'Keyword for the Open PHP logs command' ),
			].join( ' ' ),
			callback: setStateCallback( 'openPHPLogs', __( 'Select site to open PHP logs' ) ),
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
			callback: setStateCallback( 'changePHPVersion', __( 'Select site to change PHP version' ) ),
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#admin-interface-style` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/post-new.php`
							: `/post/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/edit.php`
							: `/posts/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/upload.php`
							: `/media/${ site.slug }`;
					navigate( link );
				},
			},
			icon: mediaIcon,
		},
		{
			name: 'uploadMedia',
			label: __( 'Upload media' ),
			callback: setStateCallback( 'uploadMedia', __( 'Select site to upload media' ) ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/media-new.php`
							: `/media/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/edit.php?post_type=page`
							: `/pages/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/post-new.php?post_type=page`
							: `/page/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/edit-comments.php`
							: `/comments/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/themes.php`
							: `/themes/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/theme-install.php`
							: `/themes/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/plugins.php`
							: `/plugins/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/plugin-install.php`
							: `/plugins/${ site.slug }`;
					navigate( link );
				},
				filter: ( site: SiteExcerptData ) => site?.jetpack,
			},
			icon: pluginsIcon,
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/users.php`
							: `/people/team/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/user-new.php`
							: `/people/new/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/subscribers/${ site.slug }#add-subscribers` );
				},
			},
			icon: subscriberIcon,
		},
		{
			name: 'manageSubscribers',
			label: __( 'Manage subscribers' ),
			callback: setStateCallback( 'manageSubscribers', __( 'Select site to manage subscribers' ) ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/subscribers/${ site.slug }` );
				},
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/import/${ site.slug }` );
				},
			},
			icon: uploadIcon,
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/options-general.php`
							: `/settings/general/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/options-writing.php`
							: `/settings/writing/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/options-reading.php`
							: `/settings/reading/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					const link =
						( site.jetpack && ! site.is_wpcom_atomic ) ||
						'wp-admin' === site.options?.wpcom_admin_interface
							? `${ site.URL }/wp-admin/options-discussion.php`
							: `/settings/discussion/${ site.slug }`;
					navigate( link );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/settings/newsletter/${ site.slug }` );
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
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/settings/podcasting/${ site.slug }` );
				},
			},
			icon: settingsIcon,
		},
	];

	return commands;
};
