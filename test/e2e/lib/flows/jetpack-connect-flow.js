/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from './login-flow';
import SidebarComponent from '../components/sidebar-component';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import WporgCreatorPage from '../pages/wporg-creator-page';
import JetpackAuthorizePage from '../pages/jetpack-authorize-page';
import WPAdminJetpackPage from '../pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../pages/wp-admin/wp-admin-sidebar.js';
import WPAdminLogonPage from '../pages/wp-admin/wp-admin-logon-page';
import WPAdminInPlaceApprovePage from '../pages/wp-admin/wp-admin-in-place-approve-page';
import WPAdminInPlacePlansPage from '../pages/wp-admin/wp-admin-in-place-plans-page';
import * as driverManager from '../driver-manager';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';
// import NoticesComponent from '../components/notices-component';

export default class JetpackConnectFlow {
	constructor( driver, account, template ) {
		this.driver = driver;
		this.account = account;
		this.template = template;
	}

	async createJNSite() {
		global.__JNSite = true;

		const wporgCreator = await WporgCreatorPage.Visit(
			this.driver,
			WporgCreatorPage._getCreatorURL( this.template )
		);

		await wporgCreator.waitForWpadmin( this.template );
		this.url = await wporgCreator.getUrl();
		this.password = await wporgCreator.getPassword();
		this.username = await wporgCreator.getUsername();
	}

	async connectFromWPAdmin() {
		await driverManager.ensureNotLoggedIn( this.driver );
		await this.createJNSite();
		await WPAdminSidebar.refreshIfJNError( this.driver );
		const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
		await wpAdminSidebar.selectJetpack();
		await driverHelper.refreshIfJNError( this.driver );
		const wpAdminJetpack = await WPAdminJetpackPage.Expect( this.driver );
		await wpAdminJetpack.connectWordPressCom();
		const loginFlow = new LoginFlow( this.driver, this.account );
		await loginFlow.loginUsingExistingForm();
		const jetpackAuthorizePage = await JetpackAuthorizePage.Expect( this.driver );
		await jetpackAuthorizePage.approveConnection();
		await jetpackAuthorizePage.waitToDisappear();
		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		return await pickAPlanPage.selectFreePlanJetpack();
	}

	async inPlaceConnectFromWPAdmin() {
		await driverManager.ensureNotLoggedIn( this.driver );
		const loginFlow = new LoginFlow( this.driver, 'jetpackConnectUser' );
		await loginFlow.login();
		await this.createJNSite();
		await WPAdminSidebar.refreshIfJNError( this.driver );
		await ( await WPAdminSidebar.Expect( this.driver ) ).selectJetpack();
		await driverHelper.refreshIfJNError( this.driver );
		await ( await WPAdminJetpackPage.Expect( this.driver ) ).inPlaceConnect();
		await ( await WPAdminInPlaceApprovePage.Expect( this.driver ) ).approve();
		await ( await WPAdminInPlacePlansPage.Expect( this.driver ) ).selectFreePlan();
		return await WPAdminJetpackPage.Expect( this.driver );
	}

	async removeSites( timeout = config.get( 'mochaTimeoutMS' ) ) {
		const timeStarted = Date.now();
		await new LoginFlow( this.driver, this.account ).loginAndSelectMySite();

		const removeSites = async () => {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			const siteRemoved = await sidebarComponent.removeBrokenSite();
			if ( ! siteRemoved || Date.now() - timeStarted > 0.8 * timeout ) {
				// 80% of timeout
				// no sites left to remove or removeSites taking too long
				return;
			}
			// seems like it is not waiting for this
			// const noticesComponent = await NoticesComponent.Expect( this.driver );
			// await noticesComponent.dismissNotice();
			return await removeSites();
		};

		return await removeSites();
	}

	async disconnectFromWPAdmin( account ) {
		// 'Login into wporg site'
		const user = dataHelper.getAccountConfig( account );
		await driverManager.clearCookiesAndDeleteLocalStorage( this.driver );
		const loginPage = await WPAdminLogonPage.Visit( this.driver, user[ 2 ] );
		await loginPage.login( user[ 0 ], user[ 1 ] );

		// 'Can navigate to the Jetpack dashboard'
		const wpAdminSidebar = await WPAdminSidebar.Expect( this.driver );
		await wpAdminSidebar.selectJetpack();

		// 'Can disconnect site if connected'
		const wpAdminJetpack = await WPAdminJetpackPage.Expect( this.driver );
		if ( ! ( await wpAdminJetpack.atAGlanceDisplayed() ) ) return;
		return await wpAdminJetpack.disconnectSite();
	}
}
