/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export class ContactFormBlockComponent extends GutenbergBlockComponent {
	constructor( driver, blockID ) {
		super( driver, blockID );
	}

	async insertEmail( email ) {
		const emailSelector = By.css( '#inspector-text-control-0' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, emailSelector );

		const emailTextfield = await this.driver.findElement( emailSelector );
		return await emailTextfield.sendKeys( email );
	}

	async insertSubject( subject ) {
		const subjectSelector = By.css( '#inspector-text-control-1' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, subjectSelector );

		const subjectTextfiled = await this.driver.findElement( subjectSelector );
		return await subjectTextfiled.sendKeys( subject );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.jetpack-contact-form__create .components-button' )
		);
	}
}
