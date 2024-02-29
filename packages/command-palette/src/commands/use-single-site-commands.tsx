import { Gridicon, JetpackLogo, WooCommerceWooLogo } from '@automattic/components';
import { SiteCapabilities } from '@automattic/data-stores';
import {
	alignJustify as acitvityLogIcon,
	backup as backupIcon,
	brush as brushIcon,
	chartBar as statsIcon,
	code as codeIcon,
	commentAuthorAvatar as profileIcon,
	commentAuthorName as subscriberIcon,
	download as downloadIcon,
	edit as editIcon,
	globe as domainsIcon,
	help as helpIcon,
	home as dashboardIcon,
	key as keyIcon,
	media as mediaIcon,
	page as pageIcon,
	payment as creditCardIcon,
	people as peopleIcon,
	plugins as pluginsIcon,
	plus as plusIcon,
	postComments as postCommentsIcon,
	reusableBlock as cacheIcon,
	seen as seenIcon,
	settings as settingsIcon,
	tool as toolIcon,
	wordpress as wordpressIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Command } from '../use-command-palette';
import { isCustomDomain } from '../utils';
import { useCommandsParams } from './types';
import useCommandNavigation from './use-command-navigation';

enum SiteType {
	ATOMIC = 'atomic',
	SIMPLE = 'simple',
}

interface CapabilityCommand extends Command {
	capability?: string;
	siteType?: SiteType;
	publicOnly?: boolean;
	isCustomDomain?: boolean;
	filterP2?: boolean;
	filterStaging?: boolean;
}

interface CustomWindow {
	commandPaletteConfig?: {
		siteId: string;
		isAdmin: boolean;
		isAtomic: boolean;
		isStaging: boolean;
		isSelfHosted: boolean;
		isSimple: boolean;
		isPrivate: boolean;
		isComingSoon: boolean;
		isP2: boolean;
		capabilities: {
			[ key: string ]: string;
		};
		isWpcomStore: boolean;
		shouldUseWpAdmin: boolean;
	};
}

const useSingleSiteCommands = ( { navigate, currentRoute }: useCommandsParams ): Command[] => {
	const { __, _x } = useI18n();
	const commandNavigation = useCommandNavigation( { navigate, currentRoute } );
	const customWindow = window as CustomWindow | undefined;
	const {
		isAtomic = false,
		isStaging = false,
		isSelfHosted = false,
		isSimple = false,
		isPrivate = false,
		isComingSoon = false,
		capabilities = {},
		isP2 = false,
		isWpcomStore = false,
		shouldUseWpAdmin = false,
	} = customWindow?.commandPaletteConfig || {};

	let siteType: SiteType | null = null;
	if ( isAtomic && ! isSelfHosted ) {
		siteType = SiteType.ATOMIC;
	}

	if ( isSimple ) {
		siteType = SiteType.SIMPLE;
	}

	const commands: CapabilityCommand[] = [
		{
			name: 'viewMySites',
			label: __( 'View my sites', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'view my sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
				_x( 'manage sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
				_x( 'sites dashboard', 'Keyword for the View my sites command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( 'https://wordpress.com/sites' ),
			icon: wordpressIcon,
		},
		{
			name: 'getHelp',
			label: __( 'Get help', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'get help', 'Keyword for the Get help command', __i18n_text_domain__ ),
				_x( 'contact support', 'Keyword for the Get help command', __i18n_text_domain__ ),
				_x( 'help center', 'Keyword for the Get help command', __i18n_text_domain__ ),
			].join( ' ' ),
			// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
			callback: commandNavigation( 'https://wordpress.com/support' ),
			icon: helpIcon,
		},
		{
			name: 'clearCache',
			label: __( 'Clear cache', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site#cache' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: cacheIcon,
		},
		{
			name: 'enableEdgeCache',
			label: __( 'Enable edge cache', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site#edge' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			publicOnly: true,
			icon: cacheIcon,
		},
		{
			name: 'disableEdgeCache',
			label: __( 'Disable edge cache', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site#edge' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			publicOnly: true,
			icon: cacheIcon,
		},
		{
			name: 'manageCacheSettings',
			label: __( 'Manage cache settings', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'manage cache settings',
					'Keyword for the Manage cache settings command',
					__i18n_text_domain__
				),
				_x( 'clear cache', 'Keyword for the Manage cache settings command', __i18n_text_domain__ ),
				_x(
					'disable cache',
					'Keyword for the Manage cache settings command',
					__i18n_text_domain__
				),
				_x( 'enable cache', 'Keyword for the Manage cache settings command', __i18n_text_domain__ ),
				_x(
					'global edge cache',
					'Keyword for the Manage cache settings command',
					__i18n_text_domain__
				),
				_x( 'purge cache', 'Keyword for the Manage cache settings command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( '/hosting-config/:site#cache' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: cacheIcon,
		},
		{
			name: 'visitSite',
			label: __( 'Visit site homepage', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'visit site homepage',
					'Keyword for the Visit site dashboard command',
					__i18n_text_domain__
				),
				_x( 'visit site', 'Keyword for the Visit site dashboard command', __i18n_text_domain__ ),
				_x( 'see site', 'Keyword for the Visit site dashboard command', __i18n_text_domain__ ),
				_x( 'browse site', 'Keyword for the Visit site dashboard command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/:site' ],
			callback: commandNavigation( ':site' ),
			icon: seenIcon,
		},
		{
			name: 'openSiteDashboard',
			label: __( 'Open site dashboard', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open site dashboard',
					'Keyword for the Open site dashboard command',
					__i18n_text_domain__
				),
				_x( 'admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
				_x( 'wp-admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( '/wp-admin' ),
			icon: dashboardIcon,
		},
		{
			name: 'openHostingConfiguration',
			label: __( 'Open hosting configuration', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open hosting configuration',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x(
					'admin interface style',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x( 'cache', 'Keyword for the Open hosting configuration command', __i18n_text_domain__ ),
				_x(
					'database',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x(
					'global edge cache',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x( 'hosting', 'Keyword for the Open hosting configuration command', __i18n_text_domain__ ),
				_x( 'mysql', 'Keyword for the Open hosting configuration command', __i18n_text_domain__ ),
				_x(
					'phpmyadmin',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x(
					'php version',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x(
					'sftp/ssh credentials',
					'Keyword for the Open hosting configuration command',
					__i18n_text_domain__
				),
				_x( 'wp-cli', 'Keyword for the Open hosting configuration command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( '/hosting-config/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			filterP2: true,
			icon: settingsIcon,
		},
		{
			name: 'openPHPmyAdmin',
			label: __( 'Open database in phpMyAdmin', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open database in phpmyadmin',
					'Keyword for the Open database in phpMyAdmin command',
					__i18n_text_domain__
				),
				_x(
					'database',
					'Keyword for the Open database in phpMyAdmin command',
					__i18n_text_domain__
				),
				_x( 'mysql', 'Keyword for the Open database in phpMyAdmin command', __i18n_text_domain__ ),
				_x(
					'phpmyadmin',
					'Keyword for the Open database in phpMyAdmin command',
					__i18n_text_domain__
				),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( '/hosting-config/:site#database-access' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: pageIcon,
		},
		{
			name: 'openProfile',
			label: __( 'Open my profile', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'open my profile', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
				_x( 'account', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
				_x( 'display name', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
				_x( 'gravatar', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/me` ),
			icon: profileIcon,
		},
		{
			name: 'viewDeveloperFeatures',
			label: __( 'View developer features', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'view developer features',
					'Keyword for the View developer features command',
					__i18n_text_domain__
				),
				_x( 'profile', 'Keyword for the View developer features command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( `/me/developer` ),
			icon: codeIcon,
		},
		{
			name: 'openReader',
			label: __( 'Open reader', __i18n_text_domain__ ),
			callback: commandNavigation( `/read` ),
			icon: <Gridicon icon="reader" />,
		},
		{
			name: 'openJetpackSettings',
			label: __( 'Open Jetpack settings', __i18n_text_domain__ ),
			callback: commandNavigation( `/wp-admin/admin.php?page=jetpack#/settings` ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'addJetpack',
			label: __( 'Add Jetpack to a self-hosted site', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'Add Jetpack to a self-hosted site',
					'Keyword for Add Jetpack to a self-hosted site command',
					__i18n_text_domain__
				),
				_x(
					'connect jetpack',
					'Keyword for Add Jetpack to a self-hosted site command',
					__i18n_text_domain__
				),
			].join( ' ' ),
			callback: commandNavigation( `/jetpack/connect?cta_from=command-palette` ),
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'manageJetpackModules',
			label: __( 'Manage Jetpack modules', __i18n_text_domain__ ),
			callback: commandNavigation( `/wp-admin/admin.php?page=jetpack_modules` ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'importSite',
			label: __( 'Import site to WordPress.com', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'Import site to WordPress.com',
					'Keyword for Import site to WordPress.com command',
					__i18n_text_domain__
				),
				_x(
					'migrate site',
					'Keyword for Import site to WordPress.com command',
					__i18n_text_domain__
				),
			].join( ' ' ),
			callback: commandNavigation( `/start/import?ref=command-palette` ),
			icon: downloadIcon,
		},
		{
			name: 'addNewSite',
			label: __( 'Add new site', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'add new site', 'Keyword for the Add new site command', __i18n_text_domain__ ),
				_x( 'create site', 'Keyword for the Add new site command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( 'https://wordpress.com/start/domains?source=command-palette' ),
			icon: plusIcon,
		},
		{
			name: 'openAccountSettings',
			label: __( 'Open account settings', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open account settings',
					'Keyword for the Open account settings command',
					__i18n_text_domain__
				),
				_x( 'profile', 'Keyword for the Open account settings command', __i18n_text_domain__ ),
				_x( 'email', 'Keyword for the Open account settings command', __i18n_text_domain__ ),
				_x( 'language', 'Keyword for the Open account settings command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( `/me/account` ),
			icon: profileIcon,
		},
		{
			name: 'accessPurchases',
			label: __( 'View my purchases', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'view my purchases',
					'Keyword for the View my purchases command',
					__i18n_text_domain__
				),
				_x( 'manage purchases', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
				_x( 'billing history', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
				_x( 'credit card', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
				_x( 'payment methods', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
				_x( 'subscriptions', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
				_x( 'upgrades', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/me/purchases` ),
			icon: creditCardIcon,
		},
		{
			name: 'registerDomain',
			label: __( 'Register new domain', __i18n_text_domain__ ),
			context: [ '/sites' ],
			callback: commandNavigation( `/start/domain/domain-only?ref=command-palette` ),
			icon: domainsIcon,
		},
		{
			name: 'manageDomains',
			label: __( 'Manage domains', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage domains', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'dns', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'domain mapping', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'domain registration', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'domain transfer', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'email forwarding', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'nameservers', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'subdomains', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				_x( 'whois', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( `/domains/manage` ),
			icon: domainsIcon,
		},
		{
			name: 'manageDns',
			label: __( 'Manage DNS records', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'manage dns records',
					'Keyword for the Manage DNS records command',
					__i18n_text_domain__
				),
				_x( 'cname', 'Keyword for the Manage DNS records command', __i18n_text_domain__ ),
				_x( 'mx', 'Keyword for the Manage DNS records command', __i18n_text_domain__ ),
				_x( 'txt', 'Keyword for the Manage DNS records command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			capability: SiteCapabilities.MANAGE_OPTIONS,
			isCustomDomain: true,
			callback: commandNavigation( `/domains/manage/:site/dns/:site` ),
			icon: domainsIcon,
		},
		{
			name: 'copySshConnectionString',
			label: __( 'Copy SSH connection string', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: keyIcon,
		},
		{
			name: 'openSshCredentials',
			label: __( 'Open SFTP/SSH credentials', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: keyIcon,
		},
		{
			name: 'resetSshSftpPassword',
			label: __( 'Reset SFTP/SSH password', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: keyIcon,
		},
		{
			name: 'openJetpackStats',
			label: __( 'Open Jetpack Stats', __i18n_text_domain__ ),
			callback: commandNavigation( '/stats/:site' ),
			icon: statsIcon,
		},
		{
			name: 'openActivityLog',
			label: __( 'Open activity log', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open activity log',
					'Keyword for the Open activity log command',
					__i18n_text_domain__
				),
				_x(
					'jetpack activity log',
					'Keyword for the Open activity log command',
					__i18n_text_domain__
				),
				_x( 'audit log', 'Keyword for the Open activity log command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( '/activity-log/:site' ),
			filterP2: true,
			icon: acitvityLogIcon,
		},
		{
			name: 'openJetpackBackup',
			label: __( 'Open Jetpack Backup', __i18n_text_domain__ ),
			callback: commandNavigation(
				`${ siteType === SiteType.ATOMIC ? 'https://cloud.jetpack.com' : '' }/backup/:site`
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			filterP2: true,
			icon: backupIcon,
		},
		{
			name: 'viewSiteMonitoringMetrics',
			label: __( 'View site monitoring metrics', __i18n_text_domain__ ),
			callback: commandNavigation( '/site-monitoring/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: statsIcon,
		},
		{
			name: 'openPHPLogs',
			label: __( 'Open PHP logs', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'open php logs', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
				_x( 'error logs', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
				_x( 'fatal errors', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
				_x( 'php errors', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
				_x( 'php warnings', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( '/site-monitoring/:site/php' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: acitvityLogIcon,
		},
		{
			name: 'openWebServerLogs',
			label: __( 'Open web server logs', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'open web server logs',
					'Keyword for the Open web server logs command',
					__i18n_text_domain__
				),
				_x( 'access logs', 'Keyword for the Open web server logs command', __i18n_text_domain__ ),
				_x( 'apache logs', 'Keyword for the Open web server logs command', __i18n_text_domain__ ),
				_x( 'nginx logs', 'Keyword for the Open web server logs command', __i18n_text_domain__ ),
				_x( 'request logs', 'Keyword for the Open web server logs command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( '/site-monitoring/:site/web' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: acitvityLogIcon,
		},
		{
			name: 'manageStagingSites',
			label: __( 'Manage staging sites', __i18n_text_domain__ ),
			context: [ '/hosting-config' ],
			searchLabel: [
				_x(
					'manage staging sites',
					'Keyword for the Manage staging sites command',
					__i18n_text_domain__
				),
				_x(
					'add staging site',
					'Keyword for the Manage staging sites command',
					__i18n_text_domain__
				),
				_x(
					'create staging site',
					'Keyword for the Manage staging sites command',
					__i18n_text_domain__
				),
				_x(
					'delete staging site',
					'Keyword for the Manage staging sites command',
					__i18n_text_domain__
				),
				_x(
					'sync staging site',
					'Keyword for the Manage staging sites command',
					__i18n_text_domain__
				),
			].join( ' ' ),
			callback: commandNavigation( '/hosting-config/:site#staging-site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: toolIcon,
		},
		{
			name: 'changePHPVersion',
			label: __( 'Change PHP version', __i18n_text_domain__ ),
			callback: commandNavigation( '/hosting-config/:site#web-server-settings' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: toolIcon,
		},
		{
			name: 'changeAdminInterfaceStyle',
			label: __( 'Change admin interface style', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'change admin interface style',
					'Keyword for the Change admin interface style command',
					__i18n_text_domain__
				),
				_x(
					'wp-admin',
					'Keyword for the Change admin interface style command',
					__i18n_text_domain__
				),
			].join( ' ' ),
			callback: commandNavigation( '/hosting-config/:site#admin-interface-style' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: pageIcon,
		},
		{
			name: 'addNewPost',
			label: __( 'Add new post', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'add new post', 'Keyword for the Add new post command', __i18n_text_domain__ ),
				_x( 'create post', 'Keyword for the Add new post command', __i18n_text_domain__ ),
				_x( 'write post', 'Keyword for the Add new post command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/posts' ],
			callback: commandNavigation( shouldUseWpAdmin ? '/wp-admin/post-new.php' : '/post/:site' ),
			capability: SiteCapabilities.EDIT_POSTS,
			icon: plusIcon,
		},
		{
			name: 'managePosts',
			label: __( 'Manage posts', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage posts', 'Keyword for the Manage posts command', __i18n_text_domain__ ),
				_x( 'edit posts', 'Keyword for the Manage posts command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( shouldUseWpAdmin ? '/wp-admin/edit.php' : '/posts/:site' ),
			capability: SiteCapabilities.EDIT_POSTS,
			icon: editIcon,
		},
		{
			name: 'viewMediaUploads',
			label: __( 'View media uploads', __i18n_text_domain__ ),
			searchLabel: [
				_x(
					'view media uploads',
					'Keyword for the View media uploads command',
					__i18n_text_domain__
				),
				_x( 'manage uploads', 'Keyword for the View media uploads command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( shouldUseWpAdmin ? '/wp-admin/upload.php' : '/media/:site' ),
			capability: SiteCapabilities.UPLOAD_FILES,
			icon: mediaIcon,
		},
		{
			name: 'uploadMedia',
			label: __( 'Upload media', __i18n_text_domain__ ),
			callback: commandNavigation( shouldUseWpAdmin ? '/wp-admin/media-new.php' : '/media/:site' ),
			capability: SiteCapabilities.UPLOAD_FILES,
			icon: mediaIcon,
		},
		{
			name: 'managePages',
			label: __( 'Manage pages', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage pages', 'Keyword for the Manage pages command', __i18n_text_domain__ ),
				_x( 'edit pages', 'Keyword for the Manage pages command', __i18n_text_domain__ ),
				_x( 'delete pages', 'Keyword for the Manage pages command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/edit.php?post_type=page' : '/pages/:site'
			),
			capability: SiteCapabilities.EDIT_PAGES,
			icon: editIcon,
		},
		{
			name: 'addNewPage',
			label: __( 'Add new page', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'add new page', 'Keyword for the Add new page command', __i18n_text_domain__ ),
				_x( 'create page', 'Keyword for the Add new page command', __i18n_text_domain__ ),
				_x( 'write page', 'Keyword for the Add new page command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/pages' ],
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/post-new.php?post_type=page' : '/page/:site'
			),
			capability: SiteCapabilities.EDIT_PAGES,
			icon: plusIcon,
		},
		{
			name: 'manageComments',
			label: __( 'Manage comments', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage comments', 'Keyword for the Manage comments command', __i18n_text_domain__ ),
				_x( 'edit comments', 'Keyword for the Manage comments command', __i18n_text_domain__ ),
				_x( 'delete comments', 'Keyword for the Manage comments command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/edit-comments.php' : '/comments/:site'
			),
			capability: SiteCapabilities.MODERATE_COMMENTS,
			icon: postCommentsIcon,
		},
		{
			name: 'manageThemes',
			label: __( 'Manage themes', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage themes', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
				_x( 'activate theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
				_x( 'install theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
				_x( 'delete theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( shouldUseWpAdmin ? '/wp-admin/themes.php' : '/themes/:site' ),
			capability: SiteCapabilities.EDIT_THEME_OPTIONS,
			filterP2: true,
			icon: brushIcon,
		},
		{
			name: 'installTheme',
			label: __( 'Install theme', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'install theme', 'Keyword for the Install theme command', __i18n_text_domain__ ),
				_x( 'add theme', 'Keyword for the Install theme command', __i18n_text_domain__ ),
				_x( 'upload theme', 'Keyword for the Install theme command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/theme-install.php' : '/themes/:site'
			),
			capability: SiteCapabilities.EDIT_THEME_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: brushIcon,
		},
		{
			name: 'managePlugins',
			label: __( 'Manage plugins', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage plugins', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
				_x( 'activate plugin', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
				_x( 'deactivate plugin', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
				_x( 'install plugin', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
				_x( 'delete plugin', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
				_x( 'update plugin', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( shouldUseWpAdmin ? '/wp-admin/plugins.php' : '/plugins/:site' ),
			capability: SiteCapabilities.ACTIVATE_PLUGINS,
			filterP2: true,
			icon: pluginsIcon,
		},
		{
			name: 'installPlugin',
			label: __( 'Install plugin', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'install plugin', 'Keyword for the Install plugin command', __i18n_text_domain__ ),
				_x( 'add plugin', 'Keyword for the Install plugin command', __i18n_text_domain__ ),
				_x( 'upload plugin', 'Keyword for the Install plugin command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/plugin-install.php' : '/plugins/:site'
			),
			capability: SiteCapabilities.ACTIVATE_PLUGINS,
			icon: pluginsIcon,
		},
		{
			name: 'changePlan',
			label: __( 'Change site plan', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'upgrade plan', 'Keyword for the Change site plan command', __i18n_text_domain__ ),
				_x( 'change plan', 'Keyword for the Change site plan command', __i18n_text_domain__ ),
				_x( 'add plan', 'Keyword for the Change site plan command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/sites' ],
			callback: commandNavigation( '/plans/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			filterP2: true,
			filterStaging: true,
			icon: creditCardIcon,
		},
		{
			name: 'manageMyPlan',
			label: __( 'Manage site plan', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'upgrade plan', 'Keyword for the Manage site plan command', __i18n_text_domain__ ),
				_x( 'manage plan', 'Keyword for the Manage site plan command', __i18n_text_domain__ ),
				_x( 'plan features', 'Keyword for the Manage site plan command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation( '/plans/my-plan/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			filterP2: true,
			filterStaging: true,
			icon: creditCardIcon,
		},
		{
			name: 'manageUsers',
			label: __( 'Manage users', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'manage users', 'Keyword for the Manage users command', __i18n_text_domain__ ),
				_x( 'add user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
				_x( 'delete user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
				_x( 'edit user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
				_x( 'remove user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
				_x( 'update user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/users.php' : '/people/team/:site'
			),
			capability: SiteCapabilities.LIST_USERS,
			icon: peopleIcon,
		},
		{
			name: 'addNewUser',
			label: __( 'Add new user', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'add new user', 'Keyword for the Add new user command', __i18n_text_domain__ ),
				_x( 'create user', 'Keyword for the Add new user command', __i18n_text_domain__ ),
				_x( 'invite user', 'Keyword for the Add new user command', __i18n_text_domain__ ),
			].join( ' ' ),
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/user-new.php' : '/people/new/:site'
			),
			capability: SiteCapabilities.LIST_USERS,
			icon: peopleIcon,
		},
		{
			name: 'addSubscribers',
			label: __( 'Add subscribers', __i18n_text_domain__ ),
			searchLabel: [
				_x( 'add subscribers', 'Keyword for the Add subscribers command', __i18n_text_domain__ ),
				_x( 'import subscribers', 'Keyword for the Add subscribers command', __i18n_text_domain__ ),
				_x( 'upload subscribers', 'Keyword for the Add subscribers command', __i18n_text_domain__ ),
			].join( ' ' ),
			context: [ '/subscribers' ],
			callback: commandNavigation( '/subscribers/:site#add-subscribers' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: subscriberIcon,
		},
		{
			name: 'manageSubscribers',
			label: __( 'Manage subscribers', __i18n_text_domain__ ),
			callback: commandNavigation( '/subscribers/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: subscriberIcon,
		},
		{
			name: 'downloadSubscribers',
			label: __( 'Download subscribers as CSV', __i18n_text_domain__ ),
			context: [ '/subscribers' ],
			callback: commandNavigation(
				'https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=:siteId&blog_subscribers=csv&type=all',
				{ openInNewTab: true }
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: downloadIcon,
		},
		{
			name: 'import',
			label: __( 'Import content to the site', __i18n_text_domain__ ),
			context: [ '/posts' ],
			callback: commandNavigation( '/import/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: downloadIcon,
		},
		{
			name: 'openWooCommerceSettings',
			label: __( 'Open WooCommerce settings', __i18n_text_domain__ ),
			callback: isWpcomStore
				? commandNavigation( '/wp-admin/admin.php?page=wc-admin' )
				: commandNavigation( '/woocommerce-installation/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			filterP2: true,
			icon: <WooCommerceWooLogo className="woo-command-palette" />,
		},
		{
			name: 'manageSettingsGeneral',
			label: __( 'Manage general settings', __i18n_text_domain__ ),
			context: [ '/settings' ],
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/options-general.php' : '/settings/general/:site'
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsWriting',
			label: __( 'Manage writing settings', __i18n_text_domain__ ),
			context: [ '/settings' ],
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/options-writing.php' : '/settings/writing/:site'
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsReading',
			label: __( 'Manage reading settings', __i18n_text_domain__ ),
			context: [ '/settings' ],
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/options-reading.php' : '/settings/reading/:site'
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsDiscussion',
			label: __( 'Manage discussion settings', __i18n_text_domain__ ),
			context: [ '/settings' ],
			callback: commandNavigation(
				shouldUseWpAdmin ? '/wp-admin/options-discussion.php' : '/settings/discussion/:site'
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsNewsletter',
			label: __( 'Manage newsletter settings', __i18n_text_domain__ ),
			context: [ '/settings' ],
			callback: commandNavigation( '/settings/newsletter/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsPodcast',
			label: __( 'Manage podcast settings', __i18n_text_domain__ ),
			context: [ '/settings' ],
			callback: commandNavigation( '/settings/podcasting/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
	];

	return commands
		.filter( ( command ) => {
			if ( command?.capability && ! capabilities[ command.capability ] ) {
				return false;
			}

			if ( command?.siteType && command.siteType !== siteType ) {
				return false;
			}

			if ( command?.isCustomDomain && ! isCustomDomain( window.location.host ) ) {
				return false;
			}

			if ( command?.publicOnly && ( isPrivate || isComingSoon ) ) {
				return false;
			}

			if ( command?.filterP2 && isP2 ) {
				return false;
			}

			if ( command?.filterStaging && isStaging ) {
				return false;
			}

			return true;
		} )
		.map( ( command ) => ( {
			name: command.name,
			label: command.label,
			searchLabel: command.searchLabel,
			callback: command.callback,
			icon: command.icon,
		} ) );
};

export default useSingleSiteCommands;
