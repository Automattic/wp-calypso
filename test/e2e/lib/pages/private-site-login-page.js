/** @format */

import webdriver from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

const by = webdriver.By;

export default class PrivateSiteLoginPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( '.private-login' ), url );
	}
}
