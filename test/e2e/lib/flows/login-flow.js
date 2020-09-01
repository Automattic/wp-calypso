/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginPage from '../pages/login-page.js';
import EditorPage from '../pages/editor-page';
import WPAdminLoginPage from '../pages/wp-admin/wp-admin-logon-page';
import ReaderPage from '../pages/reader-page.js';
import StatsPage from '../pages/stats-page';
import StoreDashboardPage from '../pages/woocommerce/store-dashboard-page';
import PluginsBrowserPage from '../pages/plugins-browser-page';
import GutenbergEditorComponent from '../gutenberg/gutenberg-editor-component';
import CustomerHome from '../pages/customer-home-page';

import SidebarComponent from '../components/sidebar-component.js';
import NavBarComponent from '../components/nav-bar-component.js';

import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import * as loginCookieHelper from '../login-cookie-helper';
import PagesPage from '../pages/pages-page';

const host = dataHelper.getJetpackHost();

export default class LoginFlow {
	constructor( driver, accountOrFeatures ) {
		this.driver = driver;
		if ( host !== 'WPCOM' && ! accountOrFeatures ) {
			accountOrFeatures = 'jetpackUser' + host;
		}
		accountOrFeatures = accountOrFeatures || 'defaultUser';
		if ( typeof accountOrFeatures === 'string' ) {
			const legacyConfig = dataHelper.getAccountConfig( accountOrFeatures );
			if ( ! legacyConfig ) {
				throw new Error( `Account key '${ accountOrFeatures }' not found in the configuration` );
			}

			this.account = {
				email: legacyConfig[ 0 ],
				username: legacyConfig[ 0 ],
				password: legacyConfig[ 1 ],
				loginURL: legacyConfig[ 2 ],
				legacyAccountName: accountOrFeatures,
			};
		} else {
			this.account = dataHelper.pickRandomAccountWithFeatures( accountOrFeatures );
			if ( ! this.account ) {
				throw new Error(
					`Could not find any account matching features '${ accountOrFeatures.toString() }'`
				);
			}
		}
	}

	async login( { emailSSO = false, jetpackSSO = false, useFreshLogin = false } = {} ) {
		await driverManager.ensureNotLoggedIn( this.driver );

		if (
			! useFreshLogin &&
			( await loginCookieHelper.useLoginCookies( this.driver, this.account.username ) )
		) {
			console.log( 'Reusing login cookie for ' + this.account.username );
			await this.driver.navigate().refresh();
			const continueSelector = By.css( 'div.continue-as-user a' );
			if ( await driverHelper.isElementPresent( this.driver, continueSelector ) ) {
				await driverHelper.clickWhenClickable( this.driver, continueSelector );
			}
			return;
		}

		console.log( 'Logging in as ' + this.account.username );

		let loginURL = this.account.loginURL,
			loginPage;

		if ( host !== 'WPCOM' && this.account.legacyAccountName !== 'jetpackConnectUser' ) {
			loginURL = `http://${ dataHelper.getJetpackSiteName() }/wp-admin`;
		}

		if ( jetpackSSO ) {
			loginPage = await WPAdminLoginPage.Visit( this.driver, loginURL );
			return await loginPage.logonSSO();
		}
		loginPage = await LoginPage.Visit( this.driver );

		if ( emailSSO ) {
			return await loginPage.login(
				this.account.email || this.account.username,
				this.account.password,
				emailSSO
			);
		}

		await loginPage.login( this.account.email || this.account.username, this.account.password );
		return await loginCookieHelper.saveLogin( this.driver, this.account.username );
	}

	async loginAndStartNewPost(
		siteURL = null,
		usingGutenberg = false,
		{ useFreshLogin = false } = {}
	) {
		if (
			siteURL ||
			( host !== 'WPCOM' && this.account.legacyAccountName !== 'jetpackConnectUser' )
		) {
			siteURL = siteURL || dataHelper.getJetpackSiteName();
		}

		await this.login( { useFreshLogin: useFreshLogin } );

		await this.checkForDevDocsAndRedirectToReader();

		try {
			await ReaderPage.Expect( this.driver );
		} catch ( e ) {
			await CustomerHome.Expect( this.driver );
		}

		await NavBarComponent.Expect( this.driver );

		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickCreateNewPost( { siteURL: siteURL } );

		if ( usingGutenberg ) {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.initEditor();
		}

		if ( ! usingGutenberg ) {
			this.editorPage = await EditorPage.Expect( this.driver );

			const urlDisplayed = await this.driver.getCurrentUrl();
			return await this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
		}
	}

	async loginAndStartNewPage(
		site = null,
		usingGutenberg = false,
		{ useFreshLogin = false, dismissPageTemplateSelector = true } = {}
	) {
		if ( site || ( host !== 'WPCOM' && this.account.legacyAccountName !== 'jetpackConnectUser' ) ) {
			site = site || dataHelper.getJetpackSiteName();
		}

		await this.loginAndSelectMySite( site, { useFreshLogin: useFreshLogin } );

		const sidebarComponent = await SidebarComponent.Expect( this.driver );
		await sidebarComponent.selectPages();

		const pagesPage = await PagesPage.Expect( this.driver );
		await pagesPage.selectAddNewPage();

		if ( usingGutenberg ) {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			await gEditorComponent.initEditor( { dismissPageTemplateSelector } );
		}

		if ( ! usingGutenberg ) {
			this.editorPage = await EditorPage.Expect( this.driver );

			const urlDisplayed = await this.driver.getCurrentUrl();
			return await this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
		}
	}

	async loginAndSelectDomains() {
		await this.loginAndSelectMySite();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectDomains();
	}

	async loginAndSelectPeople() {
		await this.loginAndSelectMySite();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPeople();
	}

	async checkForDevDocsAndRedirectToReader() {
		const urlDisplayed = await this.driver.getCurrentUrl();
		//make sure we navigate to root, in development environments we open devdocs
		if ( urlDisplayed.indexOf( 'calypso.localhost:3000' !== -1 ) ) {
			return await ReaderPage.Visit( this.driver );
		}
	}

	async loginAndSelectMySite( site = null, { useFreshLogin = false } = {} ) {
		await this.login( { useFreshLogin: useFreshLogin } );

		await this.checkForDevDocsAndRedirectToReader();

		await ReaderPage.Expect( this.driver );

		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickMySites();

		if ( site || ( host !== 'WPCOM' && this.account.legacyAccountName !== 'jetpackConnectUser' ) ) {
			const siteURL = site || dataHelper.getJetpackSiteName();
			const sideBarComponent = await SidebarComponent.Expect( this.driver );
			await sideBarComponent.selectSiteSwitcher();
			await sideBarComponent.searchForSite( siteURL );
		}
	}

	async loginAndSelectAllSites() {
		await this.loginAndSelectMySite();

		// visit stats, as home does not have an all sites option
		await StatsPage.Visit( this.driver );

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		await sideBarComponent.selectSiteSwitcher();
		return await sideBarComponent.selectAllSites();
	}

	async loginAndSelectThemes() {
		await this.loginAndSelectMySite();
		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectThemes();
	}

	async loginAndSelectManagePlugins() {
		await this.loginAndSelectPlugins();

		const pluginsBrowserPage = await PluginsBrowserPage.Expect( this.driver );
		return await pluginsBrowserPage.selectManagePlugins();
	}

	async loginAndSelectPlugins() {
		await this.loginAndSelectMySite();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPlugins();
	}

	async loginAndSelectSettings() {
		await this.loginAndSelectMySite();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectSettings();
	}

	async loginUsingExistingForm() {
		const loginPage = await LoginPage.Expect( this.driver );
		return await loginPage.login(
			this.account.email || this.account.username,
			this.account.password
		);
	}

	async loginAndOpenWooStore() {
		await this.loginAndSelectMySite();
		this.sideBarComponent = await SidebarComponent.Expect( this.driver );
		await this.sideBarComponent.selectStoreOption();
		return await StoreDashboardPage.Expect( this.driver );
	}

	async loginAndSelectWPAdmin() {
		await this.loginAndSelectMySite();
		this.sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await this.sideBarComponent.selectWPAdmin();
	}

	end() {
		if ( typeof this.account !== 'string' ) {
			dataHelper.releaseAccount( this.account );
		}
	}
}
