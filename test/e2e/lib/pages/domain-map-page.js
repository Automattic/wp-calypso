/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class MapADomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step' ) );
	}
}
