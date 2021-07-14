import GuideComponent from '../components/guide-component.js';
import NavBarComponent from '../components/nav-bar-component.js';
import SidebarComponent from '../components/sidebar-component.js';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import GutenbergEditorComponent from '../gutenberg/gutenberg-editor-component';
import * as loginCookieHelper from '../login-cookie-helper';
import CustomerHome from '../pages/customer-home-page';
import EditorPage from '../pages/editor-page';
import LoginPage from '../pages/login-page.js';
import PagesPage from '../pages/pages-page';
import PluginsBrowserPage from '../pages/plugins-browser-page';
import ReaderPage from '../pages/reader-page.js';
import WPAdminLoginPage from '../pages/wp-admin/wp-admin-logon-page';

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

	async login( { emailSSO = false, jetpackSSO = false } = {} ) {
		await driverManager.ensureNotLoggedIn( this.driver );

		// Disabling re-use of cookies as latest versions of Chrome don't currently support it.
		// We can check later to see if we can find a different way to support it.
		// if (
		// 	! useFreshLogin &&
		// 	( await loginCookieHelper.useLoginCookies( this.driver, this.account.username ) )
		// ) {
		// 	console.log( 'Reusing login cookie for ' + this.account.username );
		// 	await this.driver.navigate().refresh();
		// 	const continueLocator = By.css( 'div.continue-as-user a' );
		// 	if ( await driverHelper.isElementLocated( this.driver, continueLocator ) ) {
		// 		await driverHelper.clickWhenClickable( this.driver, continueLocator );
		// 	}
		// 	return;
		// }

		let loginURL = this.account.loginURL;
		let loginPage;

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

		if ( process.env.FLAGS === 'nav-unification' ) {
			// Makes sure that the nav-unification welcome modal will be dismissed.
			const guideComponent = new GuideComponent( this.driver );
			await guideComponent.dismiss( 1000, '.nav-unification-modal' );
		}

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

			return await this.editorPage.waitForPage();
		}
	}

	async loginAndStartNewPage(
		site = null,
		usingGutenberg = false,
		{ useFreshLogin = false, dismissPageTemplateLocator = true, editorType = 'iframe' } = {}
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
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver, editorType );
			await gEditorComponent.initEditor( { dismissPageTemplateLocator } );
		}

		if ( ! usingGutenberg ) {
			this.editorPage = await EditorPage.Expect( this.driver );

			return await this.editorPage.waitForPage();
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

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		await sideBarComponent.selectStats();
		await sideBarComponent.selectSiteSwitcher();
		return await sideBarComponent.selectAllSites();
	}

	async loginAndSelectThemes() {
		await this.loginAndSelectMySite();
		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectThemes();
	}

	async loginAndSelectManagePluginsJetpack() {
		await this.loginAndSelectPluginsJetpack();

		const pluginsBrowserPage = await PluginsBrowserPage.Expect( this.driver );
		return await pluginsBrowserPage.selectManagePlugins();
	}

	async loginAndSelectPluginsJetpack() {
		await this.loginAndSelectMySite();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPluginsJetpackConnected();
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

	async loginUsingPopup() {
		await driverHelper.waitUntilAbleToSwitchToWindow( this.driver, 1 );
		const loginPage = await LoginPage.Expect( this.driver );

		await loginPage.login(
			this.account.email || this.account.username,
			this.account.password,
			false,
			{ isPopup: true }
		);

		// Make sure we've switched back to the post window
		await driverHelper.waitUntilAbleToSwitchToWindow( this.driver, 0 );
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
