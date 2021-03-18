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
export function elementFocused(
	driver,
	locator,
	timeout = explicitWaitMS,
	pollTimeout = explicitWaitMS
) {
	return driver.wait(
		function () {
			return driver.findElement( locator ).then(
				async function ( element ) {
					// Poll if element is active every 100 ms until focused or until timeoutPolling is reached
					for ( let i = 0; i < pollTimeout / 100; i++ ) {
						const isFocused =
							( await driver.switchTo().activeElement().getId() ) === ( await element.getId() );
						if ( isFocused ) {
							return true;
						}
						await driver.sleep( 100 );
					}
					return false;
				},
				function () {
					return false;
				}
			);
		},
		timeout,
		`Timed out waiting for element with ${ locator.using } of '${ locator.value }' to be focused`
	);
}
export function fieldClearable() {
	return null;
}
export function fieldSettable() {
	return null;
}
export function linkFollowable() {
	return null;
}
export function imageVisible() {
	return null;
}
// 👇 this one doesn't fit here well
export function lazyListLoaded() {
	return null;
}
export function windowReady() {
	return null;
}
export function popupClosed() {
	return null;
}
export function alertDisplayed() {
	return null;
}
