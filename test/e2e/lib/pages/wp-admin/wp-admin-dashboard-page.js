/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminDashboardPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		// driverHelper.refreshIfJNError( driver );
		super( driver, By.css( '#wpbody #wpbody-content' ), url );
	}

	async logout() {
		const accountBarSelector = By.css( '#wp-admin-bar-my-account' );
		const logoutOptionSelector = By.css( '#wp-admin-bar-logout' );
		const element = await this.driver.findElement( accountBarSelector );
		await this.driver.actions( { bridge: true } ).move( { origin: element } ).perform();
		return await driverHelper.clickWhenClickable( this.driver, logoutOptionSelector );
	}

	async isJITMessageDisplayed( type ) {
		const jitmActionSelector = By.css( `.jitm-banner__action a[data-module="${ type }"]` );

		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			jitmActionSelector,
			1000
		);
	}

	async enterWooCommerceWizard() {
		const wooWizardSelector = By.css( 'div.woocommerce-message p.submit a.button-primary' );
		return await driverHelper.clickWhenClickable( this.driver, wooWizardSelector );
	}

	static getUrl( url ) {
		url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
		return `https://${ url }/wp-admin`;
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
