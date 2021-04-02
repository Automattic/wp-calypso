/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';
import AsyncBaseContainer from '../async-base-container';

const host = dataHelper.getJetpackHost();
const jurassicNinjaCreateURL = 'http://jurassic.ninja/create';
const TEMPLATES = {
	default: `${ jurassicNinjaCreateURL }?shortlived`,
	noJetpack: `${ jurassicNinjaCreateURL }?shortlived&nojetpack`,
	wooCommerceNoJetpack: `${ jurassicNinjaCreateURL }?shortlived&nojetpack&woocommerce`,
	gutenpack: `${ jurassicNinjaCreateURL }?shortlived&gutenberg&gutenpack`,
};

const PASSWORD_ELEMENT = By.css( '#jurassic_password' );
const USERNAME_ELEMENT = By.css( '#jurassic_username' );
const URL_ELEMENT = By.css( '#jurassic_url' );
const CONTINUE_LINK = By.linkText( 'The new WordPress is ready to go, visit it!' );

export default class WporgCreatorPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '#progress' ), url );
	}

	static async Visit( driver, url ) {
		// Randomly wait 1-10 sec before actually creating JN site.
		// It may prevent these "Service Unavailable" errors
		await driver.sleep( Math.floor( Math.random() * 10 + 1 ) * 1000 );
		const page = new this( driver, url );
		if ( ! page.url ) {
			throw new Error( `URL is required to visit the ${ page.name }` );
		}
		await page._visitInit();
		return page;
	}

	async _postInit() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			CONTINUE_LINK,
			this.explicitWaitMS * 20
		);
		return await driverHelper.clickWhenClickable( this.driver, CONTINUE_LINK );
	}

	async getPassword() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
		return await this.driver.findElement( PASSWORD_ELEMENT ).getText();
	}

	async getUsername() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, USERNAME_ELEMENT );
		return await this.driver.findElement( USERNAME_ELEMENT ).getText();
	}

	async getUrl() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, URL_ELEMENT );
		return await this.driver.findElement( URL_ELEMENT ).getText();
	}

	async waitForWpadmin( template ) {
		await driverHelper.refreshIfJNError( this.driver );

		if ( template === 'wooCommerceNoJetpack' ) {
			const selector = By.css( 'a.wc-setup-footer-links' );
			await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
			await driverHelper.clickWhenClickable( this.driver, selector );
		}

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
	}

	static _getCreatorURL( template = 'default' ) {
		if ( ! TEMPLATES[ template ] ) {
			throw new Error( 'Incorrect WporgCreatorPage template specified.' );
		}

		let url = TEMPLATES[ template ];
		if ( dataHelper.isRunningOnJetpackBranch() ) {
			url += `&branch=${ config.get( 'jetpackBranchName' ) }`;
		}
		if ( template === 'gutenpack' && dataHelper.isRunningOnLiveBranch() ) {
			url += `&calypsobranch=${ config.get( 'branchName' ) }`;
		}

		// Automatically add jetpack-beta param when running bleeding edge tests
		if ( template === 'default' && host === 'PRESSABLEBLEEDINGEDGE' ) {
			url += '&jetpack-beta';
		}
		return url;
	}
}
