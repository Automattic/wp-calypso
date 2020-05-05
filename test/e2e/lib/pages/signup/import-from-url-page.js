/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

const containerSelector = '.import-url';
const urlInputSelector = '#url-input';

export default class ImportFromURLPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( containerSelector ) );
		this.containerSelector = containerSelector;
	}

	async submitForm() {
		const buttonSelector = By.css( '.import-url__submit-button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector );
		await driverHelper.scrollIntoView( this.driver, buttonSelector );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}

	async submitURL( url ) {
		const urlInput = By.css( urlInputSelector );
		await driverHelper.waitForFieldClearable( this.driver, urlInput );
		await driverHelper.setWhenSettable( this.driver, urlInput, url );
		return await this.submitForm();
	}

	async errorDisplayed() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.import-url__url-input-message.is-error' )
		);
	}

	async getURLInputValue() {
		return await this.driver.findElement( By.css( urlInputSelector ) ).getAttribute( 'value' );
	}

	async getURLInputMessage() {
		return await this.driver.findElement( By.css( '.import-url__url-input-message' ) ).getText();
	}
}
