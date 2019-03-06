/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';

import LoginFlow from './login-flow';
import SidebarComponent from '../components/sidebar-component';
import AddNewSitePage from '../pages/add-new-site-page';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import WporgCreatorPage from '../pages/wporg-creator-page';
import JetpackAuthorizePage from '../pages/jetpack-authorize-page';
import WPAdminJetpackPage from '../pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../pages/wp-admin/wp-admin-sidebar.js';
import WPAdminLogonPage from '../pages/wp-admin/wp-admin-logon-page';
import * as driverManager from '../driver-manager';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';

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
		await wporgCreator.waitForWpadmin();
		this.url = await wporgCreator.getUrl();
		this.password = await wporgCreator.getPassword();
		this.username = await wporgCreator.getUsername();
	}

	async connectFromCalypso() {
		await driverManager.ensureNotLoggedIn( this.driver );
		await this.createJNSite();
		const loginFlow = new LoginFlow( this.driver, this.account );
		await loginFlow.loginAndSelectMySite();
		const sidebarComponent = await SidebarComponent.Expect( this.driver );
		await sidebarComponent.addNewSite( this.driver );
		const addNewSitePage = await AddNewSitePage.Expect( this.driver );
		await addNewSitePage.addSiteUrl( this.url );
		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		return await pickAPlanPage.selectFreePlanJetpack();
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
		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		await pickAPlanPage.selectFreePlanJetpack();
		await wpAdminJetpack.jumpstartDisplayed();
		return await wpAdminJetpack.activateRecommendedFeatures();
	}

	async removeSites( timeout = config.get( 'mochaTimeoutMS' ) ) {
		const timeStarted = Date.now();
		await new LoginFlow( this.driver, this.account ).loginAndSelectMySite();

		const removeSites = async () => {
			const sidebarComponent = await SidebarComponent.Expect( this.driver );
			let siteRemoved = await sidebarComponent.removeBrokenSite();
			if ( ! siteRemoved || Date.now() - timeStarted > 0.8 * timeout ) {
				// 80% of timeout
				// no sites left to remove or removeSites taking too long
				return;
			}
			// seems like it is not waiting for this
			await driverHelper.waitTillPresentAndDisplayed(
				this.driver,
				By.css( '.notice.is-success.is-dismissable' ),
				config.get( 'explicitWaitMS' ) * 2
			);
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.notice.is-dismissable .notice__dismiss' )
			);
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
