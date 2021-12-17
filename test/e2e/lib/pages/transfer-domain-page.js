import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class TransferDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step__form' ) );
	}

	async enterADomain( domain ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.transfer-domain-step__add-domain input.form-text-input' ),
			domain
		);
	}

	async clickTransferDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.transfer-domain-step__go.is-primary' )
		);
	}
}
