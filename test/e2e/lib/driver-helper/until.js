/**
 * External dependencies
 */
import { WebElementCondition, Condition } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import { getLocatorString } from './utils';

export function elementNotLocated( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition(
		`for element to NOT be located ${ locatorStr }`,
		async function ( driver ) {
			const element = ( await driver.findElements( locator ) )[ 0 ];

			return ! element ? true : element;
		}
	);
}

export function elementLocatedAndVisible( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition(
		`for element to be located and visible ${ locatorStr }`,
		async function ( driver ) {
			const element = ( await driver.findElements( locator ) )[ 0 ];
			if ( ! element ) {
				return null;
			}
			const isDisplayed = await element.isDisplayed();

			return isDisplayed ? element : null;
		}
	);
}

export function elementClickable( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition(
		`for element to be clickable ${ locatorStr }`,
		async function ( driver ) {
			const element = ( await driver.findElements( locator ) )[ 0 ];
			if ( ! element ) {
				return null;
			}
			const isEnabled = await element.isEnabled();
			const isAriaEnabled = await element
				.getAttribute( 'aria-disabled' )
				.then( ( v ) => v !== 'true' );

			return isEnabled && isAriaEnabled ? element : null;
		}
	);
}

export function elementFocused( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition(
		`for element to be focused ${ locatorStr }`,
		async function ( driver ) {
			const element = ( await driver.findElements( locator ) )[ 0 ];
			if ( ! element ) {
				return null;
			}
			const elementId = await element.getId();
			const activeElementId = await driver.switchTo().activeElement().getId();
			const isFocused = activeElementId === elementId;

			return isFocused ? element : null;
		}
	);
}

export function imageVisible( locator ) {
	const locatorStr = getLocatorString( locator );
	return new WebElementCondition(
		`for image to be visible ${ locatorStr }`,
		async function ( driver ) {
			const image = ( await driver.findElements( locator ) )[ 0 ];
			if ( ! image ) {
				return null;
			}
			const isImage = ( await image.getTagName() ).toLowerCase() === 'img';
			if ( ! isImage ) {
				throw new Error( `Located element is not an image ${ locatorStr }` );
			}
			const isVisible = await driver.executeScript(
				"return typeof arguments[ 0 ].naturalWidth !== 'undefined' && arguments[ 0 ].naturalWidth > 0;",
				image
			);

			return isVisible ? image : null;
		}
	);
}

export function numberOfWindowsOpen( number ) {
	return new Condition( `for ${ number } of windows to be open`, async function ( driver ) {
		const handles = await driver.getAllWindowHandles();
		return handles.length === number ? handles : null;
	} );
}
