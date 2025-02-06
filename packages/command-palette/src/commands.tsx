import { JetpackLogo, WooCommerceWooLogo } from '@automattic/components';
import { SiteCapabilities } from '@automattic/data-stores';
import {
	alignJustify as acitvityLogIcon,
	atSymbol as emailIcon,
	backup as backupIcon,
	brush as brushIcon,
	category as categoryIcon,
	chartBar as statsIcon,
	cloud as hostingIcon,
	code as codeIcon,
	commentAuthorAvatar as profileIcon,
	commentAuthorName as subscriberIcon,
	commentReplyLink as formResponsesIcon,
	connection as siteHealthIcon,
	currencyDollar as earnIcon,
	download as downloadIcon,
	edit as editIcon,
	globe as domainsIcon,
	help as helpIcon,
	home as dashboardIcon,
	inbox as crowdsignalIcon,
	key as keyIcon,
	layout as siteEditorIcon,
	media as mediaIcon,
	megaphone as marketingIcon,
	page as pageIcon,
	payment as creditCardIcon,
	people as peopleIcon,
	plugins as pluginsIcon,
	plus as plusIcon,
	postComments as postCommentsIcon,
	reusableBlock as cacheIcon,
	search as searchIcon,
	seen as seenIcon,
	shield as antiSpamIcon,
	replace as switchIcon,
	settings as settingsIcon,
	starHalf as ratingsIcon,
	tag as tagsIcon,
	tool as toolIcon,
	wordpress as wordpressIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { KEYWORD_SEPARATOR } from './use-command-filter';
import { commandNavigation, siteUsesWpAdminInterface } from './utils';
import type { SiteExcerptData } from '@automattic/sites';

type CloseFunction = ( commandName?: string, isExecuted?: boolean ) => void;

export interface CommandCallBackParams {
	close: CloseFunction;
	setSearch: ( search: string ) => void;
	setPlaceholderOverride: ( placeholder: string ) => void;
	command: Command;
	navigate: ( url: string, openInNewTab?: boolean ) => void;
	site?: SiteExcerptData;
	currentRoute: string;
}

export enum SiteType {
	ATOMIC = 'atomic',
	SIMPLE = 'simple',
	JETPACK = 'jetpack',
}

export interface Command {
	name: string;
	label: string;
	subLabel?: string;
	searchLabel?: string;
	callback: ( params: CommandCallBackParams ) => void;
	context?: ( string | { path: string; match: string } )[];
	icon?: JSX.Element;
	image?: JSX.Element;
	siteSelector?: boolean;
	siteSelectorLabel?: string;
	capability?: string;
	siteType?: SiteType;
	publicOnly?: boolean;
	isCustomDomain?: boolean;
	filterP2?: boolean;
	filterStaging?: boolean;
	filterSelfHosted?: boolean;
	filterNotice?: string;
	emptyListNotice?: string;
	alwaysUseSiteSelector?: boolean;
	adminInterface?: 'calypso' | 'wp-admin';
}

export function useCommands() {
	const { __, _x } = useI18n();

	const siteFilters = useMemo(
		() => ( {
			hostingEnabled: {
				capability: SiteCapabilities.MANAGE_OPTIONS,
				siteType: SiteType.ATOMIC,
				filterNotice: __( 'Only listing sites with hosting features enabled.' ),
				emptyListNotice: __( 'No sites with hosting features enabled.' ),
			},
			hostingEnabledAndPublic: {
				capability: SiteCapabilities.MANAGE_OPTIONS,
				siteType: SiteType.ATOMIC,
				publicOnly: true,
				filterNotice: __( 'Only listing public sites with hosting features enabled.' ),
				emptyListNotice: __( 'No public sites with hosting features enabled.' ),
			},
		} ),
		[ __ ]
	);

	// Commands can be overridden with specific behavior for Calypso and/or WP Admin.
	// - Calypso: `client/sites-dashboard/components/wpcom-smp-commands.tsx`.
	// - WP Admin: `apps/command-palette-wp-admin/src/use-commands.ts`.
	const commands: { [ key: string ]: Command } = useMemo(
		() => ( {
			viewMySites: {
				name: 'viewMySites',
				label: __( 'View my sites', __i18n_text_domain__ ),
				callback: commandNavigation( '/sites' ),
				searchLabel: [
					_x( 'view my sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
					_x( 'manage sites', 'Keyword for the View my sites command', __i18n_text_domain__ ),
					_x( 'sites dashboard', 'Keyword for the View my sites command', __i18n_text_domain__ ),
					'wp site', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				icon: wordpressIcon,
			},
			switchSite: {
				name: 'switchSite',
				label: __( 'Switch site', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'change site', 'Keyword for the Switch site command', __i18n_text_domain__ ),
					_x( 'swap site', 'Keyword for the Switch site command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to switch to', __i18n_text_domain__ ),
				callback: ( params ) => {
					let path;
					if ( params.currentRoute.startsWith( '/wp-admin' ) ) {
						path = `/switch-site?route=${ encodeURIComponent( params.currentRoute ) }`;
					} else if ( params.currentRoute.includes( ':site' ) ) {
						// On a global page, navigate to the dashboard, otherwise keep current route.
						path = params.currentRoute;
					} else {
						path = siteUsesWpAdminInterface( params.site ) ? '/wp-admin' : '/home/:site';
					}
					return commandNavigation( path )( params );
				},
				emptyListNotice: __( "You don't have other sites to switch to.", __i18n_text_domain__ ),
				icon: switchIcon,
			},
			getHelp: {
				name: 'getHelp',
				label: __( 'Get help', __i18n_text_domain__ ),
				callback: commandNavigation( '/help' ),
				searchLabel: [
					_x( 'get help', 'Keyword for the Get help command', __i18n_text_domain__ ),
					_x( 'contact support', 'Keyword for the Get help command', __i18n_text_domain__ ),
					_x( 'help center', 'Keyword for the Get help command', __i18n_text_domain__ ),
					_x( 'send feedback', 'Keyword for the Get help command', __i18n_text_domain__ ),
					'wp help', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				icon: helpIcon,
			},
			clearCache: {
				name: 'clearCache',
				label: __( 'Clear cache', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#cache' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select a site to clear cache', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: cacheIcon,
			},
			enableEdgeCache: {
				name: 'enableEdgeCache',
				label: __( 'Enable edge cache', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#edge' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select a site to enable edge cache', __i18n_text_domain__ ),
				...siteFilters.hostingEnabledAndPublic,
				icon: cacheIcon,
			},
			disableEdgeCache: {
				name: 'disableEdgeCache',
				label: __( 'Disable edge cache', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#edge' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select a site to disable edge cache', __i18n_text_domain__ ),
				...siteFilters.hostingEnabledAndPublic,
				icon: cacheIcon,
			},
			manageCacheSettings: {
				name: 'manageCacheSettings',
				label: __( 'Manage cache settings', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#cache' ),
				searchLabel: [
					_x(
						'manage cache settings',
						'Keyword for the Manage cache settings command',
						__i18n_text_domain__
					),
					_x(
						'clear cache',
						'Keyword for the Manage cache settings command',
						__i18n_text_domain__
					),
					_x(
						'disable cache',
						'Keyword for the Manage cache settings command',
						__i18n_text_domain__
					),
					_x(
						'enable cache',
						'Keyword for the Manage cache settings command',
						__i18n_text_domain__
					),
					_x(
						'global edge cache',
						'Keyword for the Manage cache settings command',
						__i18n_text_domain__
					),
					_x(
						'purge cache',
						'Keyword for the Manage cache settings command',
						__i18n_text_domain__
					),
					'wp cache*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage cache settings', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: cacheIcon,
			},
			visitSite: {
				name: 'visitSite',
				label: __( 'Visit site homepage', __i18n_text_domain__ ),
				callback: commandNavigation( 'https://:site', true ),
				searchLabel: [
					_x(
						'visit site homepage',
						'Keyword for the Visit site dashboard command',
						__i18n_text_domain__
					),
					_x( 'visit site', 'Keyword for the Visit site dashboard command', __i18n_text_domain__ ),
					_x( 'see site', 'Keyword for the Visit site dashboard command', __i18n_text_domain__ ),
					_x( 'browse site', 'Keyword for the Visit site dashboard command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/wp-admin', '/:site' ],
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to visit the homepage', __i18n_text_domain__ ),
				icon: seenIcon,
			},
			openSiteDashboard: {
				name: 'openSiteDashboard',
				label: __( 'Open site dashboard', __i18n_text_domain__ ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin' : '/home/:site'
					)( params ),
				searchLabel: [
					_x(
						'open site dashboard',
						'Keyword for the Open site dashboard command',
						__i18n_text_domain__
					),
					_x( 'admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
					_x( 'wp-admin', 'Keyword for the Open site dashboard command', __i18n_text_domain__ ),
					'wp admin', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open dashboard', __i18n_text_domain__ ),
				icon: dashboardIcon,
			},
			openHostingOverview: {
				name: 'openHostingOverview',
				label: __( 'Open hosting overview', __i18n_text_domain__ ),
				callback: commandNavigation( '/overview/:site' ),
				context: [ '/sites' ],
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open hosting overview', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterSelfHosted: true,
				icon: hostingIcon,
			},
			openHostingConfiguration: {
				name: 'openHostingConfiguration',
				label: __( 'Open server settings', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site' ),
				searchLabel: [
					_x(
						'open hosting configuration',
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
					_x(
						'hosting',
						'Keyword for the Open hosting configuration command',
						__i18n_text_domain__
					),
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
					_x(
						'wp-cli',
						'Keyword for the Open hosting configuration command',
						__i18n_text_domain__
					),
					'wp cli', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open hosting configuration', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterSelfHosted: true,
				filterNotice: __( 'Only listing sites hosted on WordPress.com.', __i18n_text_domain__ ),
				icon: settingsIcon,
			},
			openPHPmyAdmin: {
				name: 'openPHPmyAdmin',
				label: __( 'Open database in phpMyAdmin', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#database-access' ),
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
					_x(
						'mysql',
						'Keyword for the Open database in phpMyAdmin command',
						__i18n_text_domain__
					),
					_x(
						'phpmyadmin',
						'Keyword for the Open database in phpMyAdmin command',
						__i18n_text_domain__
					),
					'wp db*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open phpMyAdmin', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: pageIcon,
			},
			openProfile: {
				name: 'openProfile',
				label: __( 'Open my profile', __i18n_text_domain__ ),
				callback: commandNavigation( '/me' ),
				searchLabel: [
					_x( 'open my profile', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
					_x( 'account', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
					_x( 'display name', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
					_x( 'gravatar', 'Keyword for the Open my profile command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				icon: profileIcon,
			},
			viewDeveloperFeatures: {
				name: 'viewDeveloperFeatures',
				label: __( 'View developer features', __i18n_text_domain__ ),
				callback: commandNavigation( '/me/developer' ),
				searchLabel: [
					_x(
						'view developer features',
						'Keyword for the View developer features command',
						__i18n_text_domain__
					),
					_x( 'profile', 'Keyword for the View developer features command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				icon: codeIcon,
			},
			openReader: {
				name: 'openReader',
				label: __( 'Open Reader', __i18n_text_domain__ ),
				callback: commandNavigation( '/reader' ),
				icon: (
					<svg height="24" viewBox="4 4 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
						<clipPath id="commands-a">
							<path d="m4 11.2002h24v10.2857h-24z"></path>
						</clipPath>
						<g clipPath="url(#commands-a)">
							<path d="m4.94437 16.8443-.94437-.0656v-1.4979l1.05696-.0515c.73758-2.4238 2.27248-3.924 4.78852-4.0248 2.48152-.0961 4.13592 1.2541 5.05502 3.6099.3317-.1946.7077-.297 1.0903-.297s.7586.1024 1.0903.297c.9604-2.3863 2.6355-3.7505 5.1722-3.6005 2.4632.1406 3.9591 1.6408 4.6828 4.0177l1.057.0492v1.444c-.0528.0304-.0873.0726-.1149.0679-.6893-.1054-.9007.211-1.0615.8861-.586 2.4589-2.7872 3.9732-5.3538 3.7927-2.2977-.1618-4.2302-2.1097-4.5381-4.5475-.0359-.2323-.1505-.4444-.3239-.5995-.1734-.155-.3945-.2431-.625-.249-.2239.01-.4376.0984-.6051.2505-.1674.152-.2783.3582-.314.5839-.3332 2.5785-2.3506 4.4983-4.8115 4.5756-2.60796.0821-4.67824-1.608-5.20213-4.245-.01149-.1313-.05974-.2509-.0988-.3962zm5.05505 3.0942c.93708.0075 1.83898-.3643 2.50778-1.034.6689-.6696 1.0503-1.5824 1.0606-2.5384.0049-.9553-.3621-1.8736-1.0204-2.5531s-1.5541-1.0646-2.4905-1.0708c-.93734-.0075-1.83926.3647-2.50784 1.0349s-1.04921 1.5836-1.05831 2.5398c-.00302.4737.08568.9433.261 1.382.17532.4386.43381.8376.76065 1.1741s.7156.6038 1.14397.7866c.42836.1829.88789.2776 1.35223.2789zm11.96208 0c.9375 0 1.8366-.3798 2.4997-1.0558.6631-.6761 1.0359-1.593 1.0365-2.5494-.0048-.956-.381-1.871-1.046-2.5446-.665-.6735-1.5646-1.0507-2.5017-1.0488-.9374 0-1.8366.3797-2.4997 1.0557-.6631.6761-1.0359 1.5931-1.0365 2.5494.0021.4744.0958.9437.2757 1.3811s.4424.8344.7727 1.1683.7219.5982 1.1523.7777c.4304.1796.8912.2709 1.3562.2687z"></path>
						</g>
					</svg>
				),
			},
			openMyJetpack: {
				name: 'openMyJetpack',
				label: __( 'Open My Jetpack', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'discover Jetpack products',
						'Keyword for the Open My Jetpack command',
						__i18n_text_domain__
					),
					_x(
						'manage Jetpack products',
						'Keyword for the Open My Jetpack command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/wp-admin/admin.php?page=my-jetpack' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open My Jetpack', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				siteType: SiteType.JETPACK,
				adminInterface: 'wp-admin',
				filterNotice: __( 'Only listing sites with My Jetpack available.' ),
				emptyListNotice: __( 'No sites with My Jetpack available.' ),
				icon: <JetpackLogo size={ 18 } />,
			},
			openJetpackSettings: {
				name: 'openJetpackSettings',
				label: __( 'Open Jetpack settings', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/admin.php?page=jetpack#/dashboard' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open Jetpack settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				siteType: SiteType.JETPACK,
				filterNotice: __( 'Only listing sites with Jetpack settings available.' ),
				emptyListNotice: __( 'No sites with Jetpack settings available.' ),
				icon: <JetpackLogo size={ 18 } />,
			},
			addJetpack: {
				name: 'addJetpack',
				label: __( 'Add Jetpack to a self-hosted site', __i18n_text_domain__ ),
				callback: commandNavigation( '/jetpack/connect?cta_from=command-palette' ),
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
				].join( KEYWORD_SEPARATOR ),
				icon: <JetpackLogo size={ 18 } />,
			},
			manageJetpackModules: {
				name: 'manageJetpackModules',
				label: __( 'Manage Jetpack modules', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/admin.php?page=jetpack_modules' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage Jetpack modules', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				siteType: SiteType.JETPACK,
				filterNotice: __( 'Only listing sites with Jetpack modules available.' ),
				emptyListNotice: __( 'No sites with Jetpack modules available.' ),
				icon: <JetpackLogo size={ 18 } />,
			},
			importSite: {
				name: 'importSite',
				label: __( 'Import site to WordPress.com', __i18n_text_domain__ ),
				callback: commandNavigation( '/start/import?ref=command-palette' ),
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
				].join( KEYWORD_SEPARATOR ),
				icon: downloadIcon,
			},
			addNewSite: {
				name: 'addNewSite',
				label: __( 'Add new site', __i18n_text_domain__ ),
				callback: commandNavigation( '/start?source=command-palette' ),
				searchLabel: [
					_x( 'add new site', 'Keyword for the Add new site command', __i18n_text_domain__ ),
					_x( 'create site', 'Keyword for the Add new site command', __i18n_text_domain__ ),
					'wp site create', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				icon: plusIcon,
			},
			openAccountSettings: {
				name: 'openAccountSettings',
				label: __( 'Open account settings', __i18n_text_domain__ ),
				callback: commandNavigation( '/me/account' ),
				searchLabel: [
					_x(
						'open account settings',
						'Keyword for the Open account settings command',
						__i18n_text_domain__
					),
					_x( 'profile', 'Keyword for the Open account settings command', __i18n_text_domain__ ),
					_x( 'email', 'Keyword for the Open account settings command', __i18n_text_domain__ ),
					_x( 'language', 'Keyword for the Open account settings command', __i18n_text_domain__ ),
					'wp language*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				icon: profileIcon,
			},
			accessPurchases: {
				name: 'accessPurchases',
				label: __( 'View my purchases', __i18n_text_domain__ ),
				callback: commandNavigation( '/me/purchases' ),
				searchLabel: [
					_x(
						'view my purchases',
						'Keyword for the View my purchases command',
						__i18n_text_domain__
					),
					_x(
						'manage purchases',
						'Keyword for the View my purchases command',
						__i18n_text_domain__
					),
					_x(
						'billing history',
						'Keyword for the View my purchases command',
						__i18n_text_domain__
					),
					_x( 'credit card', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
					_x(
						'payment methods',
						'Keyword for the View my purchases command',
						__i18n_text_domain__
					),
					_x( 'subscriptions', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
					_x( 'upgrades', 'Keyword for the View my purchases command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				icon: creditCardIcon,
			},
			registerDomain: {
				name: 'registerDomain',
				label: __( 'Register new domain', __i18n_text_domain__ ),
				callback: commandNavigation( '/start/domain/domain-only?ref=command-palette' ),
				context: [ '/sites' ],
				icon: domainsIcon,
			},
			manageDomains: {
				name: 'manageDomains',
				label: __( 'Manage domains', __i18n_text_domain__ ),
				callback: commandNavigation( '/domains/manage' ),
				searchLabel: [
					_x( 'manage domains', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x( 'dns', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x( 'domain mapping', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x(
						'domain registration',
						'Keyword for the Manage domains command',
						__i18n_text_domain__
					),
					_x( 'domain transfer', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x( 'email forwarding', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x( 'nameservers', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x( 'subdomains', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
					_x( 'whois', 'Keyword for the Manage domains command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				icon: domainsIcon,
			},
			manageDns: {
				name: 'manageDns',
				label: __( 'Manage DNS records', __i18n_text_domain__ ),
				callback: commandNavigation( '/domains/manage/:site/dns/:site' ),
				searchLabel: [
					_x(
						'manage dns records',
						'Keyword for the Manage DNS records command',
						__i18n_text_domain__
					),
					_x( 'cname', 'Keyword for the Manage DNS records command', __i18n_text_domain__ ),
					_x( 'mx', 'Keyword for the Manage DNS records command', __i18n_text_domain__ ),
					_x( 'txt', 'Keyword for the Manage DNS records command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/sites' ],
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open DNS records', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				isCustomDomain: true,
				filterSelfHosted: true,
				filterNotice: __( 'Only listing sites with DNS management available.' ),
				emptyListNotice: __( 'No sites with DNS management available.' ),
				icon: domainsIcon,
			},
			manageEmails: {
				name: 'manageEmails',
				label: __( 'Manage emails', __i18n_text_domain__ ),
				callback: commandNavigation( '/email/:site' ),
				searchLabel: [
					_x( 'access email', 'Keyword for the Manage emails command', __i18n_text_domain__ ),
					_x( 'access emails', 'Keyword for the Manage emails command', __i18n_text_domain__ ),
					_x( 'set up email', 'Keyword for the Manage emails command', __i18n_text_domain__ ),
					_x( 'set up emails', 'Keyword for the Manage emails command', __i18n_text_domain__ ),
					_x( 'manage email', 'Keyword for the Manage emails command', __i18n_text_domain__ ),
					_x( 'manage emails', 'Keyword for the Manage emails command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage emails', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterStaging: true,
				filterSelfHosted: true,
				icon: emailIcon,
			},
			copySshConnectionString: {
				name: 'copySshConnectionString',
				label: __( 'Copy SSH connection string', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to copy SSH connection string', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: keyIcon,
			},
			openSshCredentials: {
				name: 'openSshCredentials',
				label: __( 'Open SFTP/SSH credentials', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
				...siteFilters.hostingEnabled,
				icon: keyIcon,
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open SFTP/SSH credentials', __i18n_text_domain__ ),
			},
			resetSshSftpPassword: {
				name: 'resetSshSftpPassword',
				label: __( 'Reset SFTP/SSH password', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#sftp-credentials' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to reset SFTP/SSH password', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: keyIcon,
			},
			openJetpackStats: {
				name: 'openJetpackStats',
				label: __( 'Open Jetpack Stats', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'see jetpack stats',
						'Keyword for the Open Jetpack Stats command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/admin.php?page=stats'
							: '/stats/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open Jetpack Stats', __i18n_text_domain__ ),
				icon: statsIcon,
			},
			openJetpackSearch: {
				name: 'openJetpackSearch',
				label: __( 'Open Jetpack Search', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/admin.php?page=jetpack-search' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open Jetpack Search', __i18n_text_domain__ ),
				filterP2: true,
				icon: searchIcon,
			},
			openJetpackAkismet: {
				name: 'openJetpackAkismet',
				label: __( 'Open Jetpack Akismet Anti-spam', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/admin.php?page=akismet-key-config' ),
				siteSelector: true,
				siteSelectorLabel: __(
					'Select site to open Jetpack Akismet Anti-spam',
					__i18n_text_domain__
				),
				filterP2: true,
				filterSelfHosted: true,
				icon: antiSpamIcon,
			},
			openActivityLog: {
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
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						`${
							params.site?.is_wpcom_atomic && siteUsesWpAdminInterface( params.site )
								? 'https://jetpack.com/redirect/?source=calypso-activity-log&site='
								: '/activity-log/'
						}:site`
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open activity log', __i18n_text_domain__ ),
				filterP2: true,
				filterSelfHosted: true,
				filterNotice: __( 'Only listing sites hosted on WordPress.com.', __i18n_text_domain__ ),
				icon: acitvityLogIcon,
			},
			openJetpackBackup: {
				name: 'openJetpackBackup',
				label: __( 'Open Jetpack Backup', __i18n_text_domain__ ),
				callback: ( params ) =>
					commandNavigation(
						`${
							params.site?.is_wpcom_atomic && siteUsesWpAdminInterface( params.site )
								? 'https://jetpack.com/redirect/?source=calypso-backups&site='
								: '/backup/'
						}:site`
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open Jetpack Backup', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterSelfHosted: true,
				filterNotice: __( 'Only listing sites with Jetpack Backup enabled.', __i18n_text_domain__ ),
				icon: backupIcon,
			},
			viewSiteMonitoringMetrics: {
				name: 'viewSiteMonitoringMetrics',
				label: __( 'View site monitoring metrics', __i18n_text_domain__ ),
				callback: commandNavigation( '/site-monitoring/:site' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to view monitoring metrics', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: statsIcon,
			},
			openGitHubDeployments: {
				name: 'openGitHubDeployments',
				label: __( 'Open GitHub Deployments' ),
				callback: commandNavigation( '/github-deployments/:site' ),
				searchLabel: [
					_x( 'open github deployments', 'Keyword for the Open GitHub Deployments command' ),
					_x( 'github', 'Keyword for the Open GitHub Deployments command' ),
					_x( 'deployments', 'Keyword for the Open GitHub Deployments command' ),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open GitHub Deployments', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: (
					<svg
						width={ 18 }
						height={ 18 }
						viewBox="0 0 19 19"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="social-icons--enabled"
					>
						<g clipPath="url(#clip0_2014_1339)">
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M9.47169 0C4.23409 0 0 4.26531 0 9.54207C0 13.7601 2.71293 17.3305 6.47648 18.5942C6.94702 18.6892 7.11938 18.3889 7.11938 18.1363C7.11938 17.9151 7.10387 17.1568 7.10387 16.3668C4.46907 16.9356 3.9204 15.2293 3.9204 15.2293C3.49697 14.1234 2.86958 13.8392 2.86958 13.8392C2.00721 13.2546 2.9324 13.2546 2.9324 13.2546C3.88899 13.3178 4.39094 14.2341 4.39094 14.2341C5.2376 15.6874 6.60192 15.2768 7.15079 15.024C7.22911 14.4078 7.48018 13.9813 7.74677 13.7444C5.64533 13.5232 3.43435 12.7017 3.43435 9.03644C3.43435 7.99377 3.81047 7.1407 4.40645 6.47725C4.31242 6.24034 3.98302 5.26067 4.50067 3.94948C4.50067 3.94948 5.30042 3.69666 7.10367 4.92895C7.87571 4.72008 8.6719 4.61382 9.47169 4.61293C10.2714 4.61293 11.0867 4.72363 11.8395 4.92895C13.643 3.69666 14.4427 3.94948 14.4427 3.94948C14.9604 5.26067 14.6308 6.24034 14.5367 6.47725C15.1484 7.1407 15.509 7.99377 15.509 9.03644C15.509 12.7017 13.2981 13.5073 11.1809 13.7444C11.526 14.0445 11.8238 14.6131 11.8238 15.5137C11.8238 16.7933 11.8083 17.8203 11.8083 18.1361C11.8083 18.3889 11.9809 18.6892 12.4512 18.5944C16.2148 17.3303 18.9277 13.7601 18.9277 9.54207C18.9432 4.26531 14.6936 0 9.47169 0Z"
								fill="#24292F"
							/>
						</g>
						<defs>
							<clipPath id="clip0_2014_1339">
								<rect width="19" height="18.6122" fill="white" />
							</clipPath>
						</defs>
					</svg>
				),
			},
			openPHPLogs: {
				name: 'openPHPLogs',
				label: __( 'Open PHP logs', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'open php logs', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
					_x( 'error logs', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
					_x( 'fatal errors', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
					_x( 'php errors', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
					_x( 'php warnings', 'Keyword for the Open PHP logs command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/site-logs/:site/php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open PHP logs', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: acitvityLogIcon,
			},
			openWebServerLogs: {
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
					_x(
						'request logs',
						'Keyword for the Open web server logs command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/site-logs/:site/web' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open web server logs', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: acitvityLogIcon,
			},
			manageStagingSites: {
				name: 'manageStagingSites',
				label: __( 'Manage staging sites', __i18n_text_domain__ ),
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
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/staging-site/:site' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage staging sites', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: toolIcon,
			},
			changePHPVersion: {
				name: 'changePHPVersion',
				label: __( 'Change PHP version', __i18n_text_domain__ ),
				callback: commandNavigation( '/hosting-config/:site#web-server-settings' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to change PHP version', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: toolIcon,
			},
			changeAdminInterfaceStyle: {
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
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/options-general.php'
							: '/settings/general/:site#admin-interface-style'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __(
					'Select site to change admin interface style',
					__i18n_text_domain__
				),
				...siteFilters.hostingEnabled,
				icon: pageIcon,
			},
			addNewPost: {
				name: 'addNewPost',
				label: __( 'Add new post', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'add new post', 'Keyword for the Add new post command', __i18n_text_domain__ ),
					_x( 'create post', 'Keyword for the Add new post command', __i18n_text_domain__ ),
					_x( 'write post', 'Keyword for the Add new post command', __i18n_text_domain__ ),
					'wp post create', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				context: [ '/posts', { path: '/wp-admin/edit.php', match: 'exact' } ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/post-new.php' : '/post/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to add new post', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_POSTS,
				icon: plusIcon,
			},
			managePosts: {
				name: 'managePosts',
				label: __( 'Manage posts', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage posts', 'Keyword for the Manage posts command', __i18n_text_domain__ ),
					_x( 'edit posts', 'Keyword for the Manage posts command', __i18n_text_domain__ ),
					'wp post*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/edit.php' : '/posts/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage posts', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_POSTS,
				icon: editIcon,
			},
			manageCategories: {
				name: 'manageCategories',
				label: __( 'Manage categories', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'manage categories',
						'Keyword for the Manage categories command',
						__i18n_text_domain__
					),
					_x(
						'manage category',
						'Keyword for the Manage categories command',
						__i18n_text_domain__
					),
					_x(
						'edit categories',
						'Keyword for the Manage categories command',
						__i18n_text_domain__
					),
					_x( 'edit category', 'Keyword for the Manage categories command', __i18n_text_domain__ ),
					_x( 'add categories', 'Keyword for the Manage categories command', __i18n_text_domain__ ),
					_x( 'add category', 'Keyword for the Manage categories command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/posts', { path: '/wp-admin/edit.php', match: 'exact' } ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/edit-tags.php?taxonomy=category'
							: '/settings/taxonomies/category/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage categories', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_CATEGORIES,
				filterSelfHosted: true,
				icon: categoryIcon,
			},
			manageTags: {
				name: 'manageTags',
				label: __( 'Manage tags', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage tags', 'Keyword for the Manage tags command', __i18n_text_domain__ ),
					_x( 'manage tag', 'Keyword for the Manage tags command', __i18n_text_domain__ ),
					_x( 'edit tags', 'Keyword for the Manage tags command', __i18n_text_domain__ ),
					_x( 'edit tag', 'Keyword for the Manage tags command', __i18n_text_domain__ ),
					_x( 'add tags', 'Keyword for the Manage tags command', __i18n_text_domain__ ),
					_x( 'add tag', 'Keyword for the Manage tags command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/posts', { path: '/wp-admin/edit.php', match: 'exact' } ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/edit-tags.php?taxonomy=post_tag'
							: '/settings/taxonomies/post_tag/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage tags', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_CATEGORIES,
				filterSelfHosted: true,
				icon: tagsIcon,
			},
			viewMediaUploads: {
				name: 'viewMediaUploads',
				label: __( 'View media uploads', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'view media uploads',
						'Keyword for the View media uploads command',
						__i18n_text_domain__
					),
					_x(
						'manage uploads',
						'Keyword for the View media uploads command',
						__i18n_text_domain__
					),
					'wp media*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/upload.php' : '/media/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to view media uploads', __i18n_text_domain__ ),
				capability: SiteCapabilities.UPLOAD_FILES,
				icon: mediaIcon,
			},
			uploadMedia: {
				name: 'uploadMedia',
				label: __( 'Upload media', __i18n_text_domain__ ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/media-new.php' : '/media/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to upload media', __i18n_text_domain__ ),
				capability: SiteCapabilities.UPLOAD_FILES,
				icon: mediaIcon,
			},
			managePages: {
				name: 'managePages',
				label: __( 'Manage pages', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage pages', 'Keyword for the Manage pages command', __i18n_text_domain__ ),
					_x( 'edit pages', 'Keyword for the Manage pages command', __i18n_text_domain__ ),
					_x( 'delete pages', 'Keyword for the Manage pages command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/edit.php?post_type=page'
							: '/pages/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage pages', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_PAGES,
				icon: editIcon,
			},
			addNewPage: {
				name: 'addNewPage',
				label: __( 'Add new page', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'add new page', 'Keyword for the Add new page command', __i18n_text_domain__ ),
					_x( 'create page', 'Keyword for the Add new page command', __i18n_text_domain__ ),
					_x( 'write page', 'Keyword for the Add new page command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/pages', '/wp-admin/edit.php?post_type=page' ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/post-new.php?post_type=page'
							: '/page/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to add new page', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_PAGES,
				icon: plusIcon,
			},
			manageComments: {
				name: 'manageComments',
				label: __( 'Manage comments', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage comments', 'Keyword for the Manage comments command', __i18n_text_domain__ ),
					_x( 'edit comments', 'Keyword for the Manage comments command', __i18n_text_domain__ ),
					_x( 'delete comments', 'Keyword for the Manage comments command', __i18n_text_domain__ ),
					'wp comment*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/edit-comments.php'
							: '/comments/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage comments', __i18n_text_domain__ ),
				capability: SiteCapabilities.MODERATE_COMMENTS,
				icon: postCommentsIcon,
			},
			viewFormResponses: {
				name: 'viewFormResponses',
				label: __( 'View form responses', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'feedback', 'Keyword for the View form responses command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/wp-admin/edit.php?post_type=feedback' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to view form responses', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_PAGES,
				filterP2: true,
				icon: formResponsesIcon,
			},
			openCrowdsignal: {
				name: 'openCrowdsignal',
				label: __( 'Open Crowdsignal', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'create poll', 'Keyword for the Open Crowdsignal command', __i18n_text_domain__ ),
					_x( 'create survey', 'Keyword for the Open Crowdsignal command', __i18n_text_domain__ ),
					_x( 'create feedback', 'Keyword for the Open Crowdsignal command', __i18n_text_domain__ ),
					_x( 'create NPS', 'Keyword for the Open Crowdsignal command', __i18n_text_domain__ ),
					_x( 'create voting', 'Keyword for the Open Crowdsignal command', __i18n_text_domain__ ),
					_x( 'create applause', 'Keyword for the Open Crowdsignal command', __i18n_text_domain__ ),
					_x(
						'view poll results',
						'Keyword for the Open Crowdsignal command',
						__i18n_text_domain__
					),
					_x(
						'view survey results',
						'Keyword for the Open Crowdsignal command',
						__i18n_text_domain__
					),
					_x(
						'view feedback results',
						'Keyword for the Open Crowdsignal command',
						__i18n_text_domain__
					),
					_x(
						'view NPS results',
						'Keyword for the Open Crowdsignal command',
						__i18n_text_domain__
					),
					_x(
						'view voting results',
						'Keyword for the Open Crowdsignal command',
						__i18n_text_domain__
					),
					_x(
						'view applause results',
						'Keyword for the Open Crowdsignal command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/wp-admin/admin.php?page=polls' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open Crowdsignal', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_POSTS,
				filterP2: true,
				filterSelfHosted: true,
				icon: crowdsignalIcon,
			},
			viewRatings: {
				name: 'viewRatings',
				label: __( 'View ratings', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'feedback', 'Keyword for the View ratings command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/wp-admin/admin.php?page=ratings' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to view ratings', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_POSTS,
				filterP2: true,
				filterSelfHosted: true,
				icon: ratingsIcon,
			},
			manageThemes: {
				name: 'manageThemes',
				label: __( 'Manage themes', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage themes', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
					_x( 'activate theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
					_x( 'install theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
					_x( 'delete theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
					_x( 'change theme', 'Keyword for the Manage themes command', __i18n_text_domain__ ),
					'wp theme*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/themes.php' : '/themes/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage themes', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_THEME_OPTIONS,
				filterP2: true,
				icon: brushIcon,
			},
			installTheme: {
				name: 'installTheme',
				label: __( 'Install theme', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'install theme', 'Keyword for the Install theme command', __i18n_text_domain__ ),
					_x( 'add theme', 'Keyword for the Install theme command', __i18n_text_domain__ ),
					_x( 'upload theme', 'Keyword for the Install theme command', __i18n_text_domain__ ),
					'wp theme install', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/theme-install.php'
							: '/themes/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to install theme', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_THEME_OPTIONS,
				siteType: SiteType.JETPACK,
				icon: brushIcon,
			},
			openSiteEditor: {
				name: 'openSiteEditor',
				label: __( 'Open site editor', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'customize site', 'Keyword for the Open site editor command', __i18n_text_domain__ ),
					_x( 'edit site', 'Keyword for the Open site editor command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/wp-admin/site-editor.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open site editor', __i18n_text_domain__ ),
				capability: SiteCapabilities.EDIT_THEME_OPTIONS,
				filterP2: true,
				filterSelfHosted: true,
				icon: siteEditorIcon,
			},
			managePlugins: {
				name: 'managePlugins',
				label: __( 'Manage plugins', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage plugins', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
					_x( 'activate plugins', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
					_x(
						'deactivate plugins',
						'Keyword for the Manage plugins command',
						__i18n_text_domain__
					),
					_x( 'install plugins', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
					_x( 'delete plugins', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
					_x( 'update plugins', 'Keyword for the Manage plugins command', __i18n_text_domain__ ),
					'wp plugin*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/plugins.php' : '/plugins/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage plugins', __i18n_text_domain__ ),
				capability: SiteCapabilities.ACTIVATE_PLUGINS,
				filterP2: true,
				icon: pluginsIcon,
			},
			installPlugin: {
				name: 'installPlugin',
				label: __( 'Install plugin', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'install plugin', 'Keyword for the Install plugin command', __i18n_text_domain__ ),
					_x( 'add plugin', 'Keyword for the Install plugin command', __i18n_text_domain__ ),
					_x( 'upload plugin', 'Keyword for the Install plugin command', __i18n_text_domain__ ),
					'wp plugin install', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/plugin-install.php'
							: '/plugins/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to install plugin', __i18n_text_domain__ ),
				capability: SiteCapabilities.ACTIVATE_PLUGINS,
				siteType: SiteType.JETPACK,
				icon: pluginsIcon,
			},
			manageScheduledUpdates: {
				name: 'manageScheduledUpdates',
				label: __( 'Manage scheduled plugin updates', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'add plugin schedule',
						'Keyword for the Manage scheduled plugin updates command',
						__i18n_text_domain__
					),
					_x(
						'add scheduled update',
						'Keyword for the Manage scheduled plugin updates command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/plugins/scheduled-updates/:site' ),
				siteSelector: true,
				siteSelectorLabel: __(
					'Select site to manage scheduled plugin updates',
					__i18n_text_domain__
				),
				siteType: SiteType.ATOMIC,
				capability: SiteCapabilities.ACTIVATE_PLUGINS,
				icon: pluginsIcon,
			},
			changePlan: {
				name: 'changePlan',
				label: __( 'Change site plan', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'upgrade plan', 'Keyword for the Change site plan command', __i18n_text_domain__ ),
					_x( 'change plan', 'Keyword for the Change site plan command', __i18n_text_domain__ ),
					_x( 'add plan', 'Keyword for the Change site plan command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/plans/:site' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to change plan', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterStaging: true,
				icon: creditCardIcon,
			},
			manageMyPlan: {
				name: 'manageMyPlan',
				label: __( 'Manage site plan', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'upgrade plan', 'Keyword for the Manage site plan command', __i18n_text_domain__ ),
					_x( 'manage plan', 'Keyword for the Manage site plan command', __i18n_text_domain__ ),
					_x( 'plan features', 'Keyword for the Manage site plan command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/plans/my-plan/:site' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage your plan', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterStaging: true,
				icon: creditCardIcon,
			},
			manageAddOns: {
				name: 'manageAddOns',
				label: __( 'Manage add-ons', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'addons', 'Keyword for the Buy add-ons command', __i18n_text_domain__ ),
					_x( 'manage addons', 'Keyword for the Buy add-ons command', __i18n_text_domain__ ),
					_x( 'buy add-ons', 'Keyword for the Buy add-ons command', __i18n_text_domain__ ),
					_x( 'add extensions', 'Keyword for the Buy add-ons command', __i18n_text_domain__ ),
					_x( 'expand plan', 'Keyword for the Buy add-ons command', __i18n_text_domain__ ),
				].join( KEYWORD_SEPARATOR ),
				callback: commandNavigation( '/add-ons/:site' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage add-ons', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterStaging: true,
				icon: creditCardIcon,
			},
			manageUsers: {
				name: 'manageUsers',
				label: __( 'Manage users', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'manage users', 'Keyword for the Manage users command', __i18n_text_domain__ ),
					_x( 'add user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
					_x( 'delete user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
					_x( 'edit user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
					_x( 'remove user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
					_x( 'update user', 'Keyword for the Manage users command', __i18n_text_domain__ ),
					'wp user*', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/users.php' : '/people/team/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage users', __i18n_text_domain__ ),
				capability: SiteCapabilities.LIST_USERS,
				icon: peopleIcon,
			},
			addNewUser: {
				name: 'addNewUser',
				label: __( 'Add new user', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'add new user', 'Keyword for the Add new user command', __i18n_text_domain__ ),
					_x( 'create user', 'Keyword for the Add new user command', __i18n_text_domain__ ),
					_x( 'invite user', 'Keyword for the Add new user command', __i18n_text_domain__ ),
					'wp user create', // WP-CLI command
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/user-new.php' : '/people/new/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to add new user', __i18n_text_domain__ ),
				capability: SiteCapabilities.LIST_USERS,
				icon: peopleIcon,
			},
			addSubscribers: {
				name: 'addSubscribers',
				label: __( 'Add subscribers', __i18n_text_domain__ ),
				searchLabel: [
					_x( 'add subscribers', 'Keyword for the Add subscribers command', __i18n_text_domain__ ),
					_x(
						'import subscribers',
						'Keyword for the Add subscribers command',
						__i18n_text_domain__
					),
					_x(
						'upload subscribers',
						'Keyword for the Add subscribers command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				callback: ( params ) =>
					commandNavigation(
						`${
							params.site?.is_wpcom_atomic && siteUsesWpAdminInterface( params.site )
								? 'https://cloud.jetpack.com/subscribers/'
								: '/subscribers/'
						}:site#add-subscribers`
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to add subscribers', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: subscriberIcon,
			},
			manageSubscribers: {
				name: 'manageSubscribers',
				label: __( 'Manage subscribers', __i18n_text_domain__ ),
				callback: ( params ) =>
					commandNavigation(
						`${
							params.site?.is_wpcom_atomic && siteUsesWpAdminInterface( params.site )
								? 'https://cloud.jetpack.com/subscribers/'
								: '/subscribers/'
						}:site`
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage subscribers', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: subscriberIcon,
			},
			downloadSubscribers: {
				name: 'downloadSubscribers',
				label: __( 'Download subscribers as CSV', __i18n_text_domain__ ),
				callback: commandNavigation(
					'https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=:siteId&blog_subscribers=csv&type=all',
					true
				),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to download subscribers', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: downloadIcon,
			},
			import: {
				name: 'import',
				label: __( 'Import content to the site', __i18n_text_domain__ ),
				searchLabel: 'wp import', // WP-CLI command
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/import.php' : '/import/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to import content', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: downloadIcon,
			},
			export: {
				name: 'export',
				label: __( 'Export content from the site', __i18n_text_domain__ ),
				searchLabel: 'wp export', // WP-CLI command
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site ) ? '/wp-admin/export.php' : '/export/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to export content from', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: downloadIcon,
			},
			openWooCommerceSettings: {
				name: 'openWooCommerceSettings',
				label: __( 'Open WooCommerce settings', __i18n_text_domain__ ),
				callback: ( params ) =>
					commandNavigation(
						params.site?.options?.is_wpcom_store
							? '/wp-admin/admin.php?page=wc-admin'
							: '/woocommerce-installation/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open WooCommerce settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterSelfHosted: true,
				icon: <WooCommerceWooLogo className="woo-command-palette" />,
			},
			manageSettingsGeneral: {
				name: 'manageSettingsGeneral',
				label: __( 'Manage general settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'change site title',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
					_x(
						'change tagline',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
					_x(
						'change site icon',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
					_x(
						'change site language',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
					_x(
						'change timezone',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
					_x(
						'change date format',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
					_x(
						'change time format',
						'Keyword for the Manage general settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/options-general.php'
							: '/settings/general/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage general settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsWriting: {
				name: 'manageSettingsWriting',
				label: __( 'Manage writing settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'change default post category',
						'Keyword for the Manage writing settings command',
						__i18n_text_domain__
					),
					_x(
						'change default post format',
						'Keyword for the Manage writing settings command',
						__i18n_text_domain__
					),
					_x(
						'configure post via email',
						'Keyword for the Manage writing settings command',
						__i18n_text_domain__
					),
					_x(
						'enable custom content types',
						'Keyword for the Manage writing settings command',
						__i18n_text_domain__
					),
					_x(
						'enable CPTs',
						'Keyword for the Manage writing settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/options-writing.php'
							: '/settings/writing/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage writing settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsReading: {
				name: 'manageSettingsReading',
				label: __( 'Manage reading settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'change homepage behavior',
						'Keyword for the Manage reading settings command',
						__i18n_text_domain__
					),
					_x(
						'change blog pagination',
						'Keyword for the Manage reading settings command',
						__i18n_text_domain__
					),
					_x(
						'change feed content',
						'Keyword for the Manage reading settings command',
						__i18n_text_domain__
					),
					_x(
						'change site visibility',
						'Keyword for the Manage reading settings command',
						__i18n_text_domain__
					),
					_x(
						'manage related posts settings',
						'Keyword for the Manage reading settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/options-reading.php'
							: '/settings/writing/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage reading settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsDiscussion: {
				name: 'manageSettingsDiscussion',
				label: __( 'Manage discussion settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'manage default post settings',
						'Keyword for the Manage discussion settings command',
						__i18n_text_domain__
					),
					_x(
						'manage comment settings',
						'Keyword for the Manage discussion settings command',
						__i18n_text_domain__
					),
					_x(
						'manage email notifications',
						'Keyword for the Manage discussion settings command',
						__i18n_text_domain__
					),
					_x(
						'manage avatar settings',
						'Keyword for the Manage discussion settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/options-discussion.php'
							: '/settings/discussion/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage discussion settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsMedia: {
				name: 'manageSettingsMedia',
				label: __( 'Manage media settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'set max image size',
						'Keyword for the Manage media settings command',
						__i18n_text_domain__
					),
					_x(
						'set maximum image dimensions',
						'Keyword for the Manage media settings command',
						__i18n_text_domain__
					),
					_x(
						'manage image gallery settings',
						'Keyword for the Manage media settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: commandNavigation( '/wp-admin/options-media.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage media settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsNewsletter: {
				name: 'manageSettingsNewsletter',
				label: __( 'Manage newsletter settings', __i18n_text_domain__ ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: ( params ) =>
					commandNavigation(
						siteUsesWpAdminInterface( params.site )
							? '/wp-admin/admin.php?page=jetpack#/newsletter'
							: '/settings/newsletter/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage newsletter settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsPodcast: {
				name: 'manageSettingsPodcast',
				label: __( 'Manage podcast settings', __i18n_text_domain__ ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: commandNavigation( '/settings/podcasting/:site' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage podcast settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: settingsIcon,
			},
			manageSettingsPerformance: {
				name: 'manageSettingsPerformance',
				label: __( 'Manage performance settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'improve site performance',
						'Keyword for the Manage performance settings command',
						__i18n_text_domain__
					),
					_x(
						'optimize load times',
						'Keyword for the Manage performance settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: ( params ) =>
					commandNavigation(
						params.site?.is_wpcom_atomic && siteUsesWpAdminInterface( params.site )
							? '/wp-admin/options-general.php?page=page-optimize'
							: '/settings/performance/:site'
					)( params ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage performance settings', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				icon: settingsIcon,
			},
			manageSettingsPermalinks: {
				name: 'manageSettingsPermalinks',
				label: __( 'Manage permalink settings', __i18n_text_domain__ ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: commandNavigation( '/wp-admin/options-permalink.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage permalink settings', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: settingsIcon,
			},
			manageSettingsPrivacy: {
				name: 'manageSettingsPrivacy',
				label: __( 'Manage privacy settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'create privacy policy page',
						'Keyword for the Manage privacy settings command',
						__i18n_text_domain__
					),
					_x(
						'change privacy policy page',
						'Keyword for the Manage privacy settings command',
						__i18n_text_domain__
					),
					_x(
						'edit privacy policy page',
						'Keyword for the Manage privacy settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: commandNavigation( '/wp-admin/options-privacy.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage privacy settings', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: settingsIcon,
			},
			manageSettingsCrowdsignal: {
				name: 'manageSettingsCrowdsignal',
				label: __( 'Manage Crowdsignal settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'change Crowdsignal API key',
						'Keyword for the Manage Crowdsignal settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: commandNavigation( '/wp-admin/options-general.php?page=crowdsignal-settings' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage Crowdsignal settings', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: settingsIcon,
			},
			manageSettingsRating: {
				name: 'manageSettingsRating',
				label: __( 'Manage rating settings', __i18n_text_domain__ ),
				searchLabel: [
					_x(
						'show ratings',
						'Keyword for the Manage ratings settings command',
						__i18n_text_domain__
					),
					_x(
						'change ratings position',
						'Keyword for the Manage ratings settings command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				context: [ '/settings', '/wp-admin/options-' ],
				callback: commandNavigation( '/wp-admin/options-general.php?page=ratingsettings' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to manage rating settings', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: settingsIcon,
			},
			openMarketingTools: {
				name: 'openMarketingTools',
				label: __( 'Open marketing tools', __i18n_text_domain__ ),
				callback: commandNavigation( '/marketing/:site' ),
				searchLabel: [
					_x(
						'access marketing tools',
						'Keyword for the Open marketing tools command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open marketing tools', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				icon: marketingIcon,
			},
			openMonetizationTools: {
				name: 'openMonetizationTools',
				label: __( 'Open monetization tools', __i18n_text_domain__ ),
				callback: ( params ) =>
					commandNavigation(
						`${
							params.site?.is_wpcom_atomic && siteUsesWpAdminInterface( params.site )
								? 'https://jetpack.com/redirect/?source=calypso-monetize&site='
								: '/earn/'
						}:site`
					)( params ),
				searchLabel: [
					_x(
						'access monetization tools',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'earn money',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'collect payments',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'receive donations',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'create subscriber-only content',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'set up paid newsletter',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'collect PayPal payments',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'earn ad revenue',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
					_x(
						'refer a friend',
						'Keyword for the Open monetization tools command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open monetization tools', __i18n_text_domain__ ),
				capability: SiteCapabilities.MANAGE_OPTIONS,
				filterP2: true,
				filterSelfHosted: true,
				icon: earnIcon,
			},
			openThemeFileEditor: {
				name: 'openThemeFileEditor',
				label: __( 'Open theme file editor', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/theme-editor.php' ),
				searchLabel: [
					_x(
						'edit theme',
						'Keyword for the Open theme file editor command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open theme file editor', __i18n_text_domain__ ),
				siteType: SiteType.ATOMIC,
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: brushIcon,
			},
			openPluginFileEditor: {
				name: 'openPluginFileEditor',
				label: __( 'Open plugin file editor', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/plugin-editor.php' ),
				searchLabel: [
					_x(
						'edit plugins',
						'Keyword for the Open plugin file editor command',
						__i18n_text_domain__
					),
				].join( KEYWORD_SEPARATOR ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to open plugin file editor', __i18n_text_domain__ ),
				siteType: SiteType.ATOMIC,
				capability: SiteCapabilities.MANAGE_OPTIONS,
				icon: pluginsIcon,
			},
			checkSiteHealth: {
				name: 'checkSiteHealth',
				label: __( 'Check site health', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/site-health.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to check site health', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: siteHealthIcon,
			},
			exportPersonalData: {
				name: 'exportPersonalData',
				label: __( 'Export personal data', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/export-personal-data.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to export personal data', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: peopleIcon,
			},
			erasePersonalData: {
				name: 'erasePersonalData',
				label: __( 'Erase personal data', __i18n_text_domain__ ),
				callback: commandNavigation( '/wp-admin/erase-personal-data.php' ),
				siteSelector: true,
				siteSelectorLabel: __( 'Select site to erase personal data', __i18n_text_domain__ ),
				...siteFilters.hostingEnabled,
				icon: peopleIcon,
			},
		} ),
		[ __, _x, siteFilters ]
	);

	return commands;
}
