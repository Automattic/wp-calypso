/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import PressableSiteSettingsPage from './pressable-site-settings-page';
import * as driverHelper from '../../driver-helper';

export default class PressableSitesPage extends AsyncBaseContainer {
	constructor( driver, url = 'https://my.pressable.com/sites' ) {
		super( driver, By.css( '.site-show-sections.admin-area' ), url );
	}

	async addNewSite( siteName ) {
		const formSelector = By.css( 'form[action="/sites"]' );
		const siteNameInput = By.css( '#new_site_name' );
		const addNewSiteButton = By.css( '.new-site-index-button' );
		const wpAdminSiteButton = By.css(
			`div.wp-admin-btn a[href="http://${ siteName }.mystagingwebsite.com/wp-admin"]`
		);

		const present = await driverHelper.isElementPresent( this.driver, formSelector );
		if ( present ) {
			await this.deleteFirstSite();
		}
		await driverHelper.setWhenSettable( this.driver, siteNameInput, siteName );
		await driverHelper.clickWhenClickable( this.driver, addNewSiteButton );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			wpAdminSiteButton,
			this.explicitWaitMS * 12
		);
		// wait until new site is properly setted up
		return await this.driver.sleep( 3000 );
	}

	async gotoSettings( siteName ) {
		const siteSettingsButton = By.xpath(
			`//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'${ siteName }')]]//div[contains(@class, 'manage-settings')]`
		);

		return await driverHelper.clickWhenClickable(
			this.driver,
			siteSettingsButton,
			this.explicitWaitMS * 2
		);
	}

	async gotoWPAdmin( siteName ) {
		const siteSettingsButton = By.xpath(
			`//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'${ siteName }')]]//div[contains(@class, 'manage-settings')]`
		);
		return await driverHelper.clickWhenClickable( this.driver, siteSettingsButton );
	}

	async deleteFirstSite() {
		const siteSettingsButton = By.xpath(
			"//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'e2eflowtesting')]]//div[contains(@class, 'manage-settings')]"
		);
		if ( ! ( await driverHelper.isElementPresent( this.driver, siteSettingsButton ) ) ) {
			return; // no sites to delete
		}
		await this.gotoSettings( 'e2eflowtesting' );
		const pressableSiteSettingsPage = await PressableSiteSettingsPage.Expect( this.driver );
		return await pressableSiteSettingsPage.deleteSite();
	}
}
