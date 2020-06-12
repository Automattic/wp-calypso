/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export class ContactFormBlockComponent extends GutenbergBlockComponent {
	constructor( driver, blockID ) {
		super( driver, blockID );
	}

	async _postInit() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.components-button.block-editor-block-variation-picker__variation' ) );
	}

	async openEditSettings() {
		const editSelector = By.css( '.jetpack-contact-form-settings-selector' );
		return await driverHelper.clickWhenClickable( this.driver, editSelector );
	}

	async insertEmail( email ) {
		const emailSelector = By.css(
			'.jetpack-contact-form__popover .components-base-control:nth-child(1) .components-text-control__input'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, emailSelector );

		const emailTextfield = await this.driver.findElement( emailSelector );
		return await emailTextfield.sendKeys( email );
	}

	async insertSubject( subject ) {
		const subjectSelector = By.css(
			'.jetpack-contact-form__popover .components-base-control:nth-child(2) .components-text-control__input'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, subjectSelector );

		const subjectTextfield = await this.driver.findElement( subjectSelector );
		return await subjectTextfield.sendKeys( subject );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.jetpack-contact-form__create .components-button' )
		);
	}
}
