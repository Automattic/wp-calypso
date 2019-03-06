/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

export default class MapADomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step' ) );
	}
}
