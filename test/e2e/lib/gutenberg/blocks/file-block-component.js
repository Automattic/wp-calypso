import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export class FileBlockComponent extends GutenbergBlockComponent {
	async uploadFile( fileDetails ) {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.components-form-file-upload ' )
		);
		const filePathInput = await this.driver.findElement(
			By.css( '.components-form-file-upload input[type="file"]' )
		);
		await filePathInput.sendKeys( fileDetails.file );
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.wp-block-image .components-spinner' )
		); // Wait for upload spinner to complete
	}
}
