/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

export default class MapADomainCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout__payment-box-container' ) );
	}
}
