/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../../driver-helper';

export default class MediaBlockFlows {
	constructor( driver, blockComponent ) {
		this.driver = driver;
		this.blockComponent = blockComponent;
	}

	async uploadImage( fileDetails ) {
		await driverHelper.waitUntilLocatedAndVisible(
			this.driver,
			By.css( `${ this.blockComponent.blockID } .components-form-file-upload` )
		);
		const filePathInput = await this.driver.findElement(
			By.css( `${ this.blockComponent.blockID } .components-form-file-upload input[type="file"]` )
		);
		await filePathInput.sendKeys( fileDetails.file );
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( `${ this.blockComponent.blockID } .components-spinner` )
		);
	}
}
