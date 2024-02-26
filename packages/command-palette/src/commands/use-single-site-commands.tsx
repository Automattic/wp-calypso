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
import { useCommandsParams } from './types';
import useCommandNavigation from './use-command-navigation';

enum SiteType {
	ATOMIC = 'atomic',
	SIMPLE = 'simple',
}

interface CapabilityCommand extends Command {
	capability?: string;
	siteType?: SiteType;
}

interface CustomWindow {
	commandPaletteConfig?: {
		siteId: string;
		isAdmin: boolean;
		isAtomic: boolean;
		isSelfHosted: boolean;
		isSimple: boolean;
		capabilities: string[];
		// Add other properties as needed
	};
}

const useSingleSiteCommands = ( { navigate, currentRoute }: useCommandsParams ): Command[] => {
	const { __, _x } = useI18n();
	const commandNavigation = useCommandNavigation( { navigate, currentRoute } );
	const customWindow = window as CustomWindow | undefined;
	const {
		isAtomic = false,
		isSelfHosted = false,
		isSimple = false,
		capabilities,
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
			label: __( 'View my sites' ),
			searchLabel: [
				_x( 'view my sites', 'Keyword for the View my sites command' ),
				_x( 'manage sites', 'Keyword for the View my sites command' ),
				_x( 'sites dashboard', 'Keyword for the View my sites command' ),
			].join( ' ' ),
			callback: commandNavigation( 'https://wordpress.com/sites' ),
			icon: wordpressIcon,
		},
		{
			name: 'getHelp',
			label: __( 'Get help' ),
			searchLabel: [
				_x( 'get help', 'Keyword for the Get help command' ),
				_x( 'contact support', 'Keyword for the Get help command' ),
				_x( 'help center', 'Keyword for the Get help command' ),
			].join( ' ' ),
			// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
			callback: commandNavigation( 'https://wordpress.com/support' ),
			icon: helpIcon,
		},
		{
			name: 'clearCache',
			label: __( 'Clear cache' ),
			callback: commandNavigation( '/hosting-config/:site#cache' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: cacheIcon,
		},
		{
			name: 'enableEdgeCache',
			label: __( 'Enable edge cache' ),
			callback: commandNavigation( '/hosting-config/:site#edge' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: cacheIcon,
		},
		{
			name: 'disableEdgeCache',
			label: __( 'Disable edge cache' ),
			callback: commandNavigation( '/hosting-config/:site#edge' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/hosting-config/:site#cache' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( ':site' ),
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
			callback: commandNavigation( '/wp-admin' ),
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
			callback: commandNavigation( '/hosting-config/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/hosting-config/:site#database-access' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( `/wp-admin/admin.php?page=jetpack#/settings` ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'openJetpackSettings',
			label: __( 'Open Jetpack settings' ),
			callback: commandNavigation( `INVESTIGATE IF WE NEED A SIMPLE SITE VERSION` ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.SIMPLE,
			icon: <JetpackLogo className="gridicon" size={ 18 } />,
		},
		{
			name: 'manageJetpackModules',
			label: __( 'Manage Jetpack modules' ),
			callback: commandNavigation( `/wp-admin/admin.php?page=jetpack_modules` ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( 'https://wordpress.com/start/domains?source=command-palette' ),
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
			capability: SiteCapabilities.MANAGE_OPTIONS,
			// @TODO Check for custom domain.
			callback: commandNavigation( `/domains/manage/:site/dns/:site` ),
			icon: domainsIcon,
		},
		{
			name: 'copySshConnectionString',
			label: __( 'Copy SSH connection string' ),
			callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: keyIcon,
		},
		{
			name: 'openSshCredentials',
			label: __( 'Open SFTP/SSH credentials' ),
			callback: commandNavigation( '/hosting-config/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: keyIcon,
		},
		{
			name: 'resetSshSftpPassword',
			label: __( 'Reset SFTP/SSH password' ),
			callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: keyIcon,
		},
		{
			name: 'openJetpackStats',
			label: __( 'Open Jetpack Stats' ),
			callback: commandNavigation( '/stats/:site' ),
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
			callback: commandNavigation( '/activity-log/:site' ),
			// @TODO P2 filter
			icon: acitvityLogIcon,
		},
		{
			name: 'openJetpackBackup',
			label: __( 'Open Jetpack Backup' ),
			callback: commandNavigation( '/backup/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			// @TODO P2 filter
			icon: backupIcon,
		},
		{
			name: 'viewSiteMonitoringMetrics',
			label: __( 'View site monitoring metrics' ),
			callback: commandNavigation( '/site-monitoring/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/site-monitoring/:site/php' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/site-monitoring/:site/web' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/hosting-config/:site#staging-site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: toolIcon,
		},
		{
			name: 'changePHPVersion',
			label: __( 'Change PHP version' ),
			callback: commandNavigation( '/hosting-config/:site#web-server-settings' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/hosting-config/:site#admin-interface-style' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
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
			callback: commandNavigation( '/wp-admin/post-new.php' ),
			capability: SiteCapabilities.EDIT_POSTS,
			icon: plusIcon,
		},
		{
			name: 'managePosts',
			label: __( 'Manage posts' ),
			searchLabel: [
				_x( 'manage posts', 'Keyword for the Manage posts command' ),
				_x( 'edit posts', 'Keyword for the Manage posts command' ),
			].join( ' ' ),
			callback: commandNavigation( '/wp-admin/edit.php' ),
			capability: SiteCapabilities.EDIT_POSTS,
			icon: editIcon,
		},
		{
			name: 'viewMediaUploads',
			label: __( 'View media uploads' ),
			searchLabel: [
				_x( 'view media uploads', 'Keyword for the View media uploads command' ),
				_x( 'manage uploads', 'Keyword for the View media uploads command' ),
			].join( ' ' ),
			callback: commandNavigation( '/wp-admin/upload.php' ),
			capability: SiteCapabilities.UPLOAD_FILES,
			icon: mediaIcon,
		},
		{
			name: 'uploadMedia',
			label: __( 'Upload media' ),
			callback: commandNavigation( '/wp-admin/media-new.php' ),
			capability: SiteCapabilities.UPLOAD_FILES,
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
			callback: commandNavigation( '/wp-admin/edit.php?post_type=page' ),
			capability: SiteCapabilities.EDIT_PAGES,
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
			callback: commandNavigation( '/wp-admin/post-new.php?post_type=page' ),
			capability: SiteCapabilities.EDIT_PAGES,
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
			callback: commandNavigation( '/wp-admin/edit-comments.php' ),
			capability: SiteCapabilities.MODERATE_COMMENTS,
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
			callback: commandNavigation( '/wp-admin/themes.php' ),
			capability: SiteCapabilities.EDIT_THEME_OPTIONS,
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
			callback: commandNavigation( '/wp-admin/theme-install.php' ),
			capability: SiteCapabilities.EDIT_THEME_OPTIONS,
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
			callback: commandNavigation( '/wp-admin/plugins.php' ),
			capability: SiteCapabilities.ACTIVATE_PLUGINS,
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
			callback: commandNavigation( '/wp-admin/plugin-install.php' ),
			capability: SiteCapabilities.ACTIVATE_PLUGINS,
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
			callback: commandNavigation( '/plans/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
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
			callback: commandNavigation( '/plans/my-plan/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
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
			callback: commandNavigation( '/wp-admin/users.php' ),
			capability: SiteCapabilities.LIST_USERS,
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
			callback: commandNavigation( '/wp-admin/user-new.php' ),
			capability: SiteCapabilities.LIST_USERS,
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
			callback: commandNavigation( '/subscribers/:site#add-subscribers' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: subscriberIcon,
		},
		{
			name: 'manageSubscribers',
			label: __( 'Manage subscribers' ),
			callback: commandNavigation( '/subscribers/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: subscriberIcon,
		},
		{
			name: 'downloadSubscribers',
			label: __( 'Download subscribers as CSV' ),
			context: [ '/subscribers' ],
			// @TODO This might not work since blog != blogId. We might need to implement a :siteId
			callback: commandNavigation(
				'https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=:site&blog_subscribers=csv&type=all',
				{ openInNewTab: true }
			),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: downloadIcon,
		},
		{
			name: 'import',
			label: __( 'Import content to the site' ),
			context: [ '/posts' ],
			callback: commandNavigation( '/import/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: downloadIcon,
		},
		{
			name: 'openWooCommerceSettings',
			label: __( 'Open WooCommerce settings' ),
			// @TODO This doesn't work on atomic sites.
			callback: commandNavigation( '/wp-admin/admin.php?page=wc-admin' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.ATOMIC,
			icon: <WooCommerceWooLogo className="woo-command-palette" />,
		},
		{
			name: 'openWooCommerceSettings',
			label: __( 'Open WooCommerce settings' ),
			// @TODO This doesn't work on atomic sites.
			callback: commandNavigation( '/woocommerce-installation/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			siteType: SiteType.SIMPLE,
			icon: <WooCommerceWooLogo className="woo-command-palette" />,
		},
		{
			name: 'manageSettingsGeneral',
			label: __( 'Manage general settings' ),
			context: [ '/settings' ],
			callback: commandNavigation( '/wp-admin/options-general.php' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsWriting',
			label: __( 'Manage writing settings' ),
			context: [ '/settings' ],
			callback: commandNavigation( '/wp-admin/options-general.php' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsReading',
			label: __( 'Manage reading settings' ),
			context: [ '/settings' ],
			callback: commandNavigation( '/wp-admin/options-reading.php' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsDiscussion',
			label: __( 'Manage discussion settings' ),
			context: [ '/settings' ],
			callback: commandNavigation( '/wp-admin/options-discussion.php' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsNewsletter',
			label: __( 'Manage newsletter settings' ),
			context: [ '/settings' ],
			callback: commandNavigation( '/settings/newsletter/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
		{
			name: 'manageSettingsPodcast',
			label: __( 'Manage podcast settings' ),
			context: [ '/settings' ],
			callback: commandNavigation( '/settings/podcasting/:site' ),
			capability: SiteCapabilities.MANAGE_OPTIONS,
			icon: settingsIcon,
		},
	];

	return commands.filter( ( command ) => {
		if ( command?.capability && ! capabilities?.includes( command.capability ) ) {
			return false;
		}

		if ( command?.siteType && command.siteType !== siteType ) {
			return false;
		}

		return true;
	} );
};

export default useSingleSiteCommands;
