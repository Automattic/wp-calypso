/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

class ContactInfoBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Contact Info';
	static blockName = 'jetpack/contact-info';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-contact-info' );

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
		const setInputValue = ( name, value ) =>
			driverHelper.setWhenSettable(
				this.driver,
				By.css( `${ this.blockID } textarea[aria-label='${ name }']` ),
				value
			);

		await setInputValue( 'Email', email );
		await setInputValue( 'Phone number', phoneNumber );
		await setInputValue( 'Street Address', streetAddress );
		await setInputValue( 'Address Line 2', addressLine2 );
		await setInputValue( 'Address Line 3', addressLine3 );
		await setInputValue( 'City', city );
		await setInputValue( 'State/Province/Region', state );
		await setInputValue( 'Postal/Zip Code', zipCode );
		await setInputValue( 'Country', country );

		if ( linkToGmaps ) {
			driverHelper.clickWhenClickable(
				this.driver,
				By.css( `${ this.blockID } span.components-form-toggle` )
			);
		}
	}
}

export { ContactInfoBlockComponent };
