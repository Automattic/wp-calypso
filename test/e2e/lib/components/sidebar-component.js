/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
// import DisconnectSurveyPage from '../pages/disconnect-survey-page.js';
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager';
import * as dataHelper from '../data-helper';

const host = dataHelper.getJetpackHost();

export default class SidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#content' ) );
		this.storeLocator = By.css( '.menu-link-text[data-e2e-sidebar="Store"]' );
	}
	async _postInit() {
		return await this.ensureSidebarMenuVisible();
	}

	async expandDrawerItem( itemName ) {
		const itemLocator = driverHelper.createTextLocator( By.css( '.sidebar__heading' ), itemName );
		const itemElement = await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			itemLocator
		);
		const isExpanded = await itemElement.getAttribute( 'aria-expanded' );
		if ( isExpanded === 'false' ) {
			await driverHelper.clickWhenClickable( this.driver, itemLocator );
		}
	}

	async selectPeople() {
		if ( host !== 'WPCOM' ) {
			await this.expandDrawerItem( 'Manage' );
			return await this._scrollToAndClickMenuItem( 'People' );
		}

		await this.expandDrawerItem( 'Users' );
		return await this._scrollToAndClickMenuItem( 'All Users' );
	}

	async selectThemes() {
		if ( host !== 'WPCOM' ) {
			await this.expandDrawerItem( 'Design' );
			return await this._scrollToAndClickMenuItem( 'Themes' );
		}
		await this.expandDrawerItem( 'Appearance' );
		return await this._scrollToAndClickMenuItem( 'Themes' );
	}

	async selectAllSitesThemes() {
		return await this._scrollToAndClickMenuItem( 'Themes' );
	}

	async selectSiteEditor() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.menu-link-text[data-e2e-sidebar*="Site Editor"]' )
		);
	}

	async selectWPAdmin() {
		//Wp-admin isn't in nav-unification. Workaround to get to wp-admin
		await this.expandDrawerItem( 'Feedback' );

		if ( driverManager.currentScreenSize() === 'mobile' ) {
			return await this._scrollToAndClickMenuItem( 'Form Responses' );
		}
	}

	async customizeTheme() {
		await this.expandDrawerItem( 'Appearance' );
		return await this._scrollToAndClickMenuItem( 'Customize' );
	}

	async selectPlans() {
		await this.expandDrawerItem( 'Upgrades\nPremium' );
		return await this._scrollToAndClickMenuItem( 'Plans' );
	}

	async selectDomains() {
		await this.expandDrawerItem( 'Upgrades\nPremium' );
		return await this._scrollToAndClickMenuItem( 'Domains' );
	}

	async selectMyHome() {
		return await this._scrollToAndClickMenuItem( 'My Home' );
	}

	async selectStats() {
		return await this._scrollToAndClickMenuItem( 'Stats' );
	}

	async selectActivity() {
		await this.expandDrawerItem( 'Jetpack' );
		return await this._scrollToAndClickMenuItem( 'Activity Log' );
	}

	async selectMarketing() {
		await this.expandDrawerItem( 'Tools' );
		return await this._scrollToAndClickMenuItem( 'Marketing' );
	}

	async selectViewThisSite() {
		return await this._scrollToAndClickMenuItem( 'sitePreview' );
	}

	async selectPlugins() {
		return await this._scrollToAndClickMenuItem( 'Plugins' );
	}

	async selectPluginsJetpackConnected() {
		await this.expandDrawerItem( 'Tools' );
		return await this._scrollToAndClickMenuItem( 'Plugins' );
	}

	async selectSettings() {
		if ( host !== 'WPCOM' ) {
			await this.expandDrawerItem( 'Manage' );
			return await this._scrollToAndClickMenuItem( 'Settings' );
		}
		await this.expandDrawerItem( 'Settings' );
		return await this._scrollToAndClickMenuItem( 'General' );
	}

	async selectMedia() {
		if ( host !== 'WPCOM' ) {
			await this.expandDrawerItem( 'Site' );
		}
		return await this._scrollToAndClickMenuItem( 'Media' );
	}

	async selectImport() {
		await this.expandDrawerItem( 'Tools' );
		return await this._scrollToAndClickMenuItem( 'Import' );
	}

	async selectPages() {
		if ( host !== 'WPCOM' ) {
			await this.expandDrawerItem( 'Site' );
			return await this._scrollToAndClickMenuItem( 'Pages' );
		}
		await this.expandDrawerItem( 'Pages' );
		return await this._scrollToAndClickMenuItem( 'All Pages' );
	}

	async selectPosts() {
		await this.expandDrawerItem( 'Posts' );
		return await this._scrollToAndClickMenuItem( 'All Posts' );
	}

	async selectComments() {
		return await this._scrollToAndClickMenuItem( 'Comments' );
	}

	async selectStoreOption() {
		return await driverHelper.clickWhenClickable( this.driver, this.storeLocator );
	}

	async settingsOptionExists( click = false ) {
		const isDisplayed = await driverHelper.isElementLocated(
			this.driver,
			SidebarComponent._getSidebarLocator( 'Settings' )
		);
		if ( click ) {
			await this._scrollToAndClickMenuItem( 'Settings' );
		}
		return isDisplayed;
	}

	async numberOfMenuItems() {
		const elements = await this.driver.findElements(
			By.css( '.sidebar li.sidebar__menu-item-parent' )
		);
		return elements.length;
	}

	async _scrollToAndClickMenuItem( target, { clickButton = false } = {} ) {
		const locator = SidebarComponent._getSidebarLocator( target, { getButton: clickButton } );

		await driverHelper.scrollIntoView( this.driver, locator );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	static _getSidebarLocator( target ) {
		return By.css( `.sidebar span[data-e2e-sidebar="${ target }"]` );
	}

	async ensureSidebarMenuVisible() {
		if ( this.screenSize === 'desktop' ) {
			return;
		}
		const openSidebarLocator = By.css( '.layout.focus-sidebar .sidebar' );
		const isOpen = await driverHelper.isElementLocated( this.driver, openSidebarLocator );

		if ( ! isOpen ) {
			const mySitesButtonLocator = By.css( 'a[data-tip-target="my-sites"]' );
			await driverHelper.clickWhenClickable( this.driver, mySitesButtonLocator );
			await driverHelper.waitUntilElementStopsMoving( this.driver, openSidebarLocator );
		}
	}

	async selectSiteSwitcher() {
		const siteSwitcherLocator = By.css( '.current-site__switch-sites button' );
		await this.ensureSidebarMenuVisible();
		const present = await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			siteSwitcherLocator,
			3000
		);
		if ( present ) {
			return await driverHelper.clickWhenClickable( this.driver, siteSwitcherLocator );
		}
		return false;
	}

	async searchForSite( searchString ) {
		const searchLocator = By.css( '.site-selector input[type="search"]' );
		const siteLocator = By.css( `.site-selector .site a[aria-label*="${ searchString }"]` );

		const searchElement = await this.driver.findElement( searchLocator );
		const searchEnabled = await searchElement.isDisplayed();

		if ( searchEnabled ) {
			await driverHelper.setWhenSettable( this.driver, searchLocator, searchString );
		}
		return await driverHelper.clickWhenClickable( this.driver, siteLocator );
	}

	async selectAllSites() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.all-sites a' ) );
	}

	async addNewSite() {
		await this.ensureSidebarMenuVisible();

		const sidebarNewSiteButton = By.css( '.my-sites-sidebar__add-new-site' );
		const siteSwitcherNewSiteButton = By.css( '.site-selector__add-new-site .button svg' );
		const present = await driverHelper.isElementLocated( this.driver, sidebarNewSiteButton );
		if ( present ) {
			return await driverHelper.clickWhenClickable( this.driver, sidebarNewSiteButton );
		}
		await this.selectSiteSwitcher();

		return await driverHelper.clickWhenClickable( this.driver, siteSwitcherNewSiteButton );
	}

	/**
	 * Removes a single jetpack site with error label from the sites list.
	 *
	 * @returns {Promise<boolean>} true if a site was removed
	 */
	async removeBrokenSite() {
		const siteSwitcherLocator = By.css( '.current-site__switch-sites' );
		const brokenSiteButton = By.css( '.is-error .site-indicator__button' );
		const disconnectJetpackButton = By.css( '.site-indicator__action a[href*="disconnect-site"]' );
		const clearSearchButton = By.css( '.search__close-icon' );

		await this.ensureSidebarMenuVisible();
		const foundSwitcher = await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			siteSwitcherLocator
		);
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		const clearSearch = await driverHelper.isElementLocated( this.driver, clearSearchButton );
		if ( clearSearch ) {
			await driverHelper.clickWhenClickable( this.driver, clearSearchButton );
		}
		const foundBroken = await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			brokenSiteButton
		);
		if ( ! foundBroken ) {
			// no broken sites
			return false;
		}

		const countLocator = By.css( '.count' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, countLocator );
		const count = await this.driver.findElement( countLocator ).getText();

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, brokenSiteButton );
		const buttons = await this.driver.findElements( brokenSiteButton );
		if ( buttons.length > 1 ) {
			await buttons[ 1 ].click();
		} else {
			await driverHelper.clickWhenClickable( this.driver, brokenSiteButton );
		}

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, disconnectJetpackButton );
		await driverHelper.clickWhenClickable( this.driver, disconnectJetpackButton );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__actions a[href*="down"]' )
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-jetpack__button-wrap a[href*="/stats"]' )
		);

		await this.driver.wait(
			async () => {
				const newCount = await this.driver.findElement( countLocator ).getText();
				return parseInt( newCount ) < parseInt( count );
			},
			this.explicitWaitMS * 2,
			'Unable to disconnect the site. Site count not updating.'
		);

		// const surveyPage = await DisconnectSurveyPage.Expect( this.driver );
		// await surveyPage.skipSurveyAndDisconnectSite();
		// Necessary to drive the loop forward
		return true;
	}

	async selectSite( siteName ) {
		const siteLocator = By.css( `.site__content[title='${ siteName }']` );
		const siteSwitcherLocator = By.css( '.current-site__switch-sites' );

		await this.ensureSidebarMenuVisible();
		const foundSwitcher = await driverHelper.isElementLocated( this.driver, siteSwitcherLocator );
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		const site = await driverHelper.isElementLocated( this.driver, siteLocator );
		if ( ! site ) {
			// site is not in present in list
			return false;
		}
		return await driverHelper.clickWhenClickable( this.driver, siteLocator );
	}
}
