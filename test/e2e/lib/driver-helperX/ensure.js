/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import config from 'config';
import * as until from './until';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export function elementLocated( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementLocated( locator ), timeout );
}
export function elementNotLocated( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementNotLocated( locator ), timeout );
}
export function elementLocatedAndVisible( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementLocatedAndVisible( locator ), timeout );
}
export function elementClickable( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementClickble( locator ), timeout );
}
export function elementFocused( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.elementFocused( locator ), timeout );
}
export function fieldClearable( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.fieldClearable( locator ), timeout );
}
export function imageVisible( driver, locator, timeout = explicitWaitMS ) {
	return driver.wait( until.imageVisible( locator ), timeout );
}
export function numberOfWindowsOpen( driver, number, timeout = explicitWaitMS ) {
	return driver.wait( until.numberOfWindowsOpen( number ), timeout );
}
export function allWindowsClosed( driver, timeout = explicitWaitMS ) {
	return driver.wait( until.allWindowsClosed(), timeout );
}
export function alertIsPresent( driver, timeout = explicitWaitMS ) {
	return driver.wait( webdriver.until.alertIsPresent(), timeout );
}
