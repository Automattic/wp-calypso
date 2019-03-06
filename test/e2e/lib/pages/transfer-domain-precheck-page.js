/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';

export default class TransferDomainPrecheckPage extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.transfer-domain-step__precheck' ),
			null,
			config.get( 'explicitWaitMS' ) * 3
		);
	}
}
