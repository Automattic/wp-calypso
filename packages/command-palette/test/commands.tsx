/* eslint-disable jest/no-conditional-expect */
import { Command, COMMANDS } from '../src';

jest.mock( '../src/utils', () => ( {
	commandNavigation: ( path: string ) => () => path,
	siteUsesWpAdminInterface: () => true,
} ) );

// We are mocking the `commandNavigation` function to return the path above,
// so executing the callback should return the path.
const getNavigationPath = ( command: Command ) => command.callback( {} );

const expectedCommandsResults = {
	// <COMMAND_NAME>: [ <PATH>, <TYPE_OF_SITE_FILTER> ]
	viewMySites: [ '/sites' ],
	getHelp: [ '/help' ],
	clearCache: [ '/hosting-config/:site#cache', 'atomicAdmin' ],
	enableEdgeCache: [ '/hosting-config/:site#edge', 'atomicAdminPublic' ],
	disableEdgeCache: [ '/hosting-config/:site#edge', 'atomicAdminPublic' ],
	manageCacheSettings: [ '/hosting-config/:site#cache', 'atomicAdmin' ],
	visitSite: [ 'https://:site' ],
	openSiteDashboard: [ '/home/:site' ],
	openHostingConfiguration: [ '/hosting-config/:site', 'wpcomAdminP2' ],
	openPHPmyAdmin: [ '/hosting-config/:site#database-access', 'atomicAdmin' ],
	openProfile: [ '/me' ],
	viewDeveloperFeatures: [ '/me/developer' ],
	openReader: [ '/read' ],
	openJetpackSettings: [ '/wp-admin/admin.php?page=jetpack#/dashboard', 'jetpackAdmin' ],
	addJetpack: [ '/jetpack/connect?cta_from=command-palette' ],
	manageJetpackModules: [ '/wp-admin/admin.php?page=jetpack_modules', 'jetpackAdmin' ],
	//
	importSite: [ '/start/import?ref=command-palette' ],
	addNewSite: [ '/start?source=command-palette' ],
	openAccountSettings: [ '/me/account' ],
	accessPurchases: [ '/me/purchases' ],
	registerDomain: [ '/start/domain/domain-only?ref=command-palette' ],
	manageDomains: [ '/domains/manage' ],
	manageDns: [ '/domains/manage/:site/dns/:site', 'wpcomAdminCustomDomain' ],
	copySshConnectionString: [ '/hosting-config/:site#sftp-credentials', 'atomicAdmin' ],
	openSshCredentials: [ '/hosting-config/:site#sftp-credentials', 'atomicAdmin' ],
	resetSshSftpPassword: [ '/hosting-config/:site#sftp-credentials', 'atomicAdmin' ],
	openJetpackStats: [ '/wp-admin/admin.php?page=stats' ],
	openActivityLog: [ '/activity-log/:site', 'wpcomP2' ],
	openJetpackBackup: [ '/backup/:site', 'wpcomAdminP2' ],
	viewSiteMonitoringMetrics: [ '/site-monitoring/:site', 'atomicAdmin' ],
	openGitHubDeployments: [ '/github-deployments/:site', 'atomicAdmin' ],
	openPHPLogs: [ '/site-monitoring/:site/php', 'atomicAdmin' ],
	openWebServerLogs: [ '/site-monitoring/:site/web', 'atomicAdmin' ],
	manageStagingSites: [ '/hosting-config/:site#staging-site', 'atomicAdmin' ],
	changePHPVersion: [ '/hosting-config/:site#web-server-settings', 'atomicAdmin' ],
	changeAdminInterfaceStyle: [ '/hosting-config/:site#admin-interface-style', 'atomicAdmin' ],
	addNewPost: [ '/wp-admin/post-new.php', 'posts' ],
	managePosts: [ '/wp-admin/edit.php', 'posts' ],
	viewMediaUploads: [ '/wp-admin/upload.php', 'media' ],
	uploadMedia: [ '/wp-admin/media-new.php', 'media' ],
	managePages: [ '/wp-admin/edit.php?post_type=page', 'pages' ],
	addNewPage: [ '/wp-admin/post-new.php?post_type=page', 'pages' ],
	manageComments: [ '/wp-admin/edit-comments.php', 'comments' ],
	manageThemes: [ '/wp-admin/themes.php', 'themesP2' ],
	installTheme: [ '/wp-admin/theme-install.php', 'themesJetpack' ],
	managePlugins: [ '/wp-admin/plugins.php', 'pluginsP2' ],
	installPlugin: [ '/wp-admin/plugin-install.php', 'pluginsJetpack' ],
	changePlan: [ '/plans/:site', 'adminStagingP2' ],
	manageMyPlan: [ '/plans/my-plan/:site', 'adminStagingP2' ],
	manageUsers: [ '/wp-admin/users.php', 'users' ],
	addNewUser: [ '/wp-admin/user-new.php', 'users' ],
	addSubscribers: [ '/subscribers/:site#add-subscribers', 'admin' ],
	manageSubscribers: [ '/subscribers/:site', 'admin' ],
	downloadSubscribers: [
		'https://dashboard.wordpress.com/wp-admin/index.php?page=subscribers&blog=:siteId&blog_subscribers=csv&type=all',
		'admin',
	],
	import: [ '/import/:site', 'admin' ],
	openWooCommerceSettings: [ '/woocommerce-installation/:site', 'wpcomAdminP2' ],
	manageSettingsGeneral: [ '/wp-admin/options-general.php', 'admin' ],
	manageSettingsWriting: [ '/wp-admin/options-writing.php', 'admin' ],
	manageSettingsReading: [ '/wp-admin/options-reading.php', 'admin' ],
	manageSettingsDiscussion: [ '/wp-admin/options-discussion.php', 'admin' ],
	manageSettingsNewsletter: [ '/wp-admin/admin.php?page=jetpack#/newsletter', 'admin' ],
	manageSettingsPodcast: [ '/settings/podcasting/:site', 'admin' ],
	sendFeedback: [ '/help' ],
};

describe( 'COMMANDS', () => {
	it( 'should be correctly defined', () => {
		for ( const [ command, expectedResults ] of Object.entries( expectedCommandsResults ) ) {
			const expectedPath = expectedResults[ 0 ];
			expect( getNavigationPath( COMMANDS[ command ] ) ).toEqual( expectedPath );

			const expectedSiteFilter = expectedResults[ 1 ];
			switch ( expectedSiteFilter ) {
				case 'atomicAdmin':
					expect( COMMANDS[ command ].siteType ).toEqual( 'atomic' );
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'atomicAdminPublic':
					expect( COMMANDS[ command ].siteType ).toEqual( 'atomic' );
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeTruthy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'wpcomAdminP2':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeTruthy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeTruthy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'jetpackAdmin':
					expect( COMMANDS[ command ].siteType ).toEqual( 'jetpack' );
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'wpcomAdminCustomDomain':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeTruthy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeTruthy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'wpcomP2':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toBeFalsy();
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeTruthy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeTruthy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'posts':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'edit_posts' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'media':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'upload_files' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'pages':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'edit_pages' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'comments':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'moderate_comments' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'themesP2':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'edit_theme_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeTruthy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'themesJetpack':
					expect( COMMANDS[ command ].siteType ).toEqual( 'jetpack' );
					expect( COMMANDS[ command ].capability ).toEqual( 'edit_theme_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'pluginsP2':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'activate_plugins' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeTruthy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'pluginsJetpack':
					expect( COMMANDS[ command ].siteType ).toEqual( 'jetpack' );
					expect( COMMANDS[ command ].capability ).toEqual( 'activate_plugins' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'adminStagingP2':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeTruthy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeTruthy();
					break;
				case 'users':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'list_users' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				case 'admin':
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toEqual( 'manage_options' );
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
				default:
					expect( COMMANDS[ command ].siteType ).toBeFalsy();
					expect( COMMANDS[ command ].capability ).toBeFalsy();
					expect( COMMANDS[ command ].publicOnly ).toBeFalsy();
					expect( COMMANDS[ command ].filterP2 ).toBeFalsy();
					expect( COMMANDS[ command ].isCustomDomain ).toBeFalsy();
					expect( COMMANDS[ command ].filterSelfHosted ).toBeFalsy();
					expect( COMMANDS[ command ].filterStaging ).toBeFalsy();
					break;
			}
		}
	} );
} );
