/**
 * External dependencies
 */
import { WebElementCondition } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import { resolveToValue } from './utils';
import { findElement, findVisibleElement, findClickableElement, getLocatorString } from './find';

export function elementLocated( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition( `for element to be located ${ locatorStr }`, ( driver ) =>
		resolveToValue( findElement( driver, locator ) )
	);
}
export function elementNotLocated( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition( `for element to NOT be located ${ locatorStr }`, ( driver ) =>
		resolveToValue( findElement( driver, locator ) ).then( ( element ) =>
			! element ? true : element
		)
	);
}
export function elementLocatedAndVisible( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition(
		`for element to be located and visible ${ locatorStr }`,
		( driver ) => resolveToValue( findVisibleElement( driver, locator ) )
	);
}
export function elementClickable( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition( `for element to be clickable ${ locatorStr }`, ( driver ) =>
		resolveToValue( findClickableElement( driver, locator ) )
	);
}
export function elementFocused() {
	return null;
}
export function linkFollowable() {
	return null;
}
export function fieldClearable() {
	return null;
}
export function fieldSettable() {
	return null;
}
export function imageVisible() {
	return null;
}
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
