/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class SiteTypePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-type__wrapper' ) );
	}

	async _selectType( type ) {
		const typeButtonSelector = By.css( `button.site-type__option[data-e2e-title='${ type }']` );
		return await driverHelper.clickWhenClickable( this.driver, typeButtonSelector );
	}

	async selectBlogType() {
		return await this._selectType( 'blog' );
	}

	async selectBusinessType() {
		return await this._selectType( 'business' );
	}

	async selectProfessionalType() {
		return await this._selectType( 'professional' );
	}

	async selectOnlineStoreType() {
		return await this._selectType( 'online-store' );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-type__wrapper button.is-primary' )
		);
	}
}
