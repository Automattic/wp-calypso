import { renderHook } from '@testing-library/react';
import { Command, useCommands } from '../src';

jest.mock( '../src/utils', () => ( {
	commandNavigation: ( path: string ) => () => path,
	siteUsesWpAdminInterface: () => true,
} ) );

// We are mocking the `commandNavigation` function to return the path above,
// so executing the callback should return the path.
const getNavigationPath = ( command: Command ) => command.callback( {} );

const siteFilters = {
	admin: { capability: 'manage_options' },
	adminAtomic: { capability: 'manage_options', siteType: 'atomic' },
	adminJetpack: { capability: 'manage_options', siteType: 'jetpack' },
	adminP2SelfHosted: { capability: 'manage_options', filterP2: true, filterSelfHosted: true },
	adminP2Staging: { capability: 'manage_options', filterP2: true, filterStaging: true },
	adminPublicAtomic: { capability: 'manage_options', publicOnly: true, siteType: 'atomic' },
	adminSelfHostedCustomDomain: {
		capability: 'manage_options',
		filterSelfHosted: true,
		isCustomDomain: true,
	},
	comments: { capability: 'moderate_comments' },
	media: { capability: 'upload_files' },
	p2SelfHosted: { filterP2: true, filterSelfHosted: true },
	pages: { capability: 'edit_pages' },
	posts: { capability: 'edit_posts' },
	users: { capability: 'list_users' },
	themesJetpack: { capability: 'edit_theme_options', siteType: 'jetpack' },
	themesP2: { capability: 'edit_theme_options', filterP2: true },
	pluginsJetpack: { capability: 'activate_plugins', siteType: 'jetpack' },
	pluginsP2: { capability: 'activate_plugins', filterP2: true },
};

const expectedCommandsResults = {
	// <COMMAND_NAME>: [ <PATH>, <SITE_FILTERS> ]
	viewMySites: [ '/sites' ],
	getHelp: [ '/help' ],
	clearCache: [ '/sites/settings/performance/:site', siteFilters.adminAtomic ],
	enableEdgeCache: [ '/sites/settings/performance/:site', siteFilters.adminPublicAtomic ],
	disableEdgeCache: [ '/sites/settings/performance/:site', siteFilters.adminPublicAtomic ],
	manageCacheSettings: [ '/sites/settings/performance/:site', siteFilters.adminAtomic ],
	visitSite: [ 'https://:site' ],
	openSiteDashboard: [ '/wp-admin' ],
	openHostingConfiguration: [ '/sites/settings/server/:site', siteFilters.adminP2SelfHosted ],
	openPHPmyAdmin: [ '/sites/settings/database/:site', siteFilters.adminAtomic ],
	openProfile: [ '/me' ],
	viewDeveloperFeatures: [ '/me/developer' ],
	openReader: [ '/reader' ],
	openJetpackSettings: [ '/wp-admin/admin.php?page=jetpack#/dashboard', siteFilters.adminJetpack ],
	addJetpack: [ '/jetpack/connect?cta_from=command-palette' ],
	manageJetpackModules: [ '/wp-admin/admin.php?page=jetpack_modules', siteFilters.adminJetpack ],
	importSite: [ '/setup/site-migration?ref=command-palette' ],
	addNewSite: [ '/start?source=command-palette' ],
	openAccountSettings: [ '/me/account' ],
	accessPurchases: [ '/me/purchases' ],
	registerDomain: [ '/start/domain/domain-only?ref=command-palette' ],
	manageDomains: [ '/domains/manage' ],
	manageDns: [ '/domains/manage/:site/dns/:site', siteFilters.adminSelfHostedCustomDomain ],
	copySshConnectionString: [ '/sites/settings/sftp-ssh/:site', siteFilters.adminAtomic ],
	openSshCredentials: [ '/sites/settings/sftp-ssh/:site', siteFilters.adminAtomic ],
	resetSshSftpPassword: [ '/sites/settings/sftp-ssh/:site', siteFilters.adminAtomic ],
	openJetpackStats: [ '/wp-admin/admin.php?page=stats' ],
	openActivityLog: [ '/activity-log/:site', siteFilters.p2SelfHosted ],
	openJetpackBackup: [ '/backup/:site', siteFilters.adminP2SelfHosted ],
	viewSiteMonitoringMetrics: [ '/site-monitoring/:site', siteFilters.adminAtomic ],
	openGitHubDeployments: [ '/github-deployments/:site', siteFilters.adminAtomic ],
	openPHPLogs: [ '/site-logs/:site/php', siteFilters.adminAtomic ],
	openWebServerLogs: [ '/site-logs/:site/web', siteFilters.adminAtomic ],
	manageStagingSites: [ '/staging-site/:site', siteFilters.adminAtomic ],
	changePHPVersion: [ '/sites/settings/server/:site', siteFilters.adminAtomic ],
	changeAdminInterfaceStyle: [ '/wp-admin/options-general.php', siteFilters.adminAtomic ],
	addNewPost: [ '/wp-admin/post-new.php', siteFilters.posts ],
	managePosts: [ '/wp-admin/edit.php', siteFilters.posts ],
	viewMediaUploads: [ '/wp-admin/upload.php', siteFilters.media ],
	uploadMedia: [ '/wp-admin/media-new.php', siteFilters.media ],
	managePages: [ '/wp-admin/edit.php?post_type=page', siteFilters.pages ],
	addNewPage: [ '/wp-admin/post-new.php?post_type=page', siteFilters.pages ],
	manageComments: [ '/wp-admin/edit-comments.php', siteFilters.comments ],
	manageThemes: [ '/wp-admin/themes.php', siteFilters.themesP2 ],
	installTheme: [ '/wp-admin/theme-install.php', siteFilters.themesJetpack ],
	managePlugins: [ '/wp-admin/plugins.php', siteFilters.pluginsP2 ],
	installPlugin: [ '/wp-admin/plugin-install.php', siteFilters.pluginsJetpack ],
	changePlan: [ '/plans/:site', siteFilters.adminP2Staging ],
	manageMyPlan: [ '/plans/my-plan/:site', siteFilters.adminP2Staging ],
	manageUsers: [ '/wp-admin/users.php', siteFilters.users ],
	addNewUser: [ '/wp-admin/user-new.php', siteFilters.users ],
	addSubscribers: [ '/subscribers/:site#add-subscribers', siteFilters.admin ],
	manageSubscribers: [ '/subscribers/:site', siteFilters.admin ],
	downloadSubscribers: [
		'https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=:siteId&blog_subscribers=csv&type=all',
		siteFilters.admin,
	],
	import: [ '/wp-admin/import.php', siteFilters.admin ],
	export: [ '/wp-admin/export.php', siteFilters.admin ],
	openWooCommerceSettings: [ '/woocommerce-installation/:site', siteFilters.adminP2SelfHosted ],
	manageSettingsGeneral: [ '/wp-admin/options-general.php', siteFilters.admin ],
	manageSettingsWriting: [ '/wp-admin/options-writing.php', siteFilters.admin ],
	manageSettingsReading: [ '/wp-admin/options-reading.php', siteFilters.admin ],
	manageSettingsDiscussion: [ '/wp-admin/options-discussion.php', siteFilters.admin ],
	manageSettingsNewsletter: [ '/wp-admin/admin.php?page=jetpack#/newsletter', siteFilters.admin ],
	manageSettingsPodcast: [ '/settings/podcasting/:site', siteFilters.admin ],
};

describe( 'COMMANDS', () => {
	it( 'should be correctly defined', () => {
		const {
			result: { current: COMMANDS },
		} = renderHook( useCommands );

		for ( const [ command, expectedResults ] of Object.entries( expectedCommandsResults ) ) {
			const expectedPath = expectedResults[ 0 ];
			expect( getNavigationPath( COMMANDS[ command ] ) ).toEqual( expectedPath );

			const expectedSiteFilters = expectedResults[ 1 ] ?? {};
			expect( COMMANDS[ command ].capability ).toEqual( expectedSiteFilters.capability );
			expect( COMMANDS[ command ].filterP2 ).toEqual( expectedSiteFilters.filterP2 );
			expect( COMMANDS[ command ].filterSelfHosted ).toEqual(
				expectedSiteFilters.filterSelfHosted
			);
			expect( COMMANDS[ command ].filterStaging ).toEqual( expectedSiteFilters.filterStaging );
			expect( COMMANDS[ command ].isCustomDomain ).toEqual( expectedSiteFilters.isCustomDomain );
			expect( COMMANDS[ command ].publicOnly ).toEqual( expectedSiteFilters.publicOnly );
			expect( COMMANDS[ command ].siteType ).toEqual( expectedSiteFilters.siteType );
		}
	} );
} );
