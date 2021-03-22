/**
 * External dependencies
 */
import { WebElementCondition } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import { resolveToValue } from './utils';
import {
	findElement,
	findElementIfClickable,
	findElementIfFocused,
	findFieldIfClearable,
	findImageIfVisible,
	findVisibleElement,
	getLocatorString,
} from './find';

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
		resolveToValue( findElementIfClickable( driver, locator ) )
	);
}
export function elementFocused( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition( `for element to be focused ${ locatorStr }`, ( driver ) =>
		resolveToValue( findElementIfFocused( driver, locator ) )
	);
}
export function fieldClearable( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition( `for field to be clearable ${ locatorStr }`, ( driver ) =>
		resolveToValue( findFieldIfClearable( driver, locator ) )
	);
}
export function imageVisible( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition( `for image to be visible ${ locatorStr }`, ( driver ) =>
		resolveToValue( findImageIfVisible( driver, locator ) )
	);
}
export function numberOfWindowsOpen( number ) {
	return new WebElementCondition( `for ${ number } of windows to be open`, async ( driver ) => {
		const handles = await driver.getAllWindowHandles();
		return handles.length === number ? handles : null;
	} );
}
export function allWindowsClosed() {
	return new WebElementCondition( 'for all windows to be closed', async ( driver ) => {
		const handles = await driver.getAllWindowHandles();
		for ( let i = handles.length - 1; i >= 0; i-- ) {
			await switchToWindowByIndex( driver, i );
			await closeCurrentWindow( driver );
		}
	} );
}
