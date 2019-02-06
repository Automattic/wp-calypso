/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class SiteTypePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-type__wrapper' ) );
	}

	async _selectType( type ) {
		const radioButtonSelector = By.css( `input.form-radio[value='${ type }']` );
		await driverHelper.setCheckbox( this.driver, radioButtonSelector );
		return await driverHelper.waitTillSelected( this.driver, radioButtonSelector );
	}

	async selectBlogType() {
		return await this._selectType( 'blog' );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-type__wrapper button.is-primary' )
		);
	}
}
