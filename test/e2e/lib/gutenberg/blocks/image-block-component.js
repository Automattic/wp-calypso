/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export class ImageBlockComponent extends GutenbergBlockComponent {
	constructor( driver, blockID ) {
		super( driver, blockID );
	}

	async uploadImage( fileDetails ) {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-form-file-upload ' )
		);
		const filePathInput = await this.driver.findElement(
			By.css( '.components-form-file-upload input[type="file"]' )
		);
		await filePathInput.sendKeys( fileDetails.file );
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.wp-block-image .components-spinner' )
		); // Wait for upload spinner to complete
	}
}
