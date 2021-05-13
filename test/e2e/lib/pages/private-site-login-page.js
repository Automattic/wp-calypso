/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

const by = webdriver.By;

export default class PrivateSiteLoginPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( '.private-login' ), url );
	}
}
