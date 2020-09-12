/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class ContactInfoBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Contact Info';
	static blockName = 'jetpack/contact-info';

	async fillUp( {
		email,
		phoneNumber,
		streetAddress,
		addressLine2,
		addressLine3,
		city,
		state,
		zipCode,
		country,
		linkToGmaps,
	} ) {
		const blockQuery = `div[id='${ this.blockID.slice( 1 ) }']`;

		const selectField = ( name ) => By.css( `${ blockQuery } textarea[aria-label='${ name }']` );

		const emailInputEl = await this.driver.findElement( selectField( 'Email' ) );
		const phoneNumberInputEl = await this.driver.findElement( selectField( 'Phone number' ) );
		const streetAddressInputEl = await this.driver.findElement( selectField( 'Street Address' ) );
		const addressLine2InputEl = await this.driver.findElement( selectField( 'Address Line 2' ) );
		const addressLine3InputEl = await this.driver.findElement( selectField( 'Address Line 3' ) );
		const cityInputEl = await this.driver.findElement( selectField( 'City' ) );
		const stateInputEl = await this.driver.findElement( selectField( 'State/Province/Region' ) );
		const zipCodeInputEl = await this.driver.findElement( selectField( 'Postal/Zip Code' ) );
		const countryInputEl = await this.driver.findElement( selectField( 'Country' ) );
		const linkToGmapsEl = await this.driver.findElement(
			By.css( `${ blockQuery } span.components-form-toggle` )
		);

		await emailInputEl.sendKeys( email );
		await phoneNumberInputEl.sendKeys( phoneNumber );
		await streetAddressInputEl.sendKeys( streetAddress );
		await addressLine2InputEl.sendKeys( addressLine2 );
		await addressLine3InputEl.sendKeys( addressLine3 );
		await cityInputEl.sendKeys( city );
		await stateInputEl.sendKeys( state );
		await zipCodeInputEl.sendKeys( zipCode );
		await countryInputEl.sendKeys( country );

		if ( linkToGmaps ) await linkToGmapsEl.click();
	}
}

export { ContactInfoBlockComponent };
