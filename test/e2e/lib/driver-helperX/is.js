/**
 * External dependencies
 */
import { WebDriver, WebElementCondition } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import { resolveToBool } from './utils';
import { findElements } from './find';

export async function elementLocated( driver, locator ) {
	const element = ( await findElements( driver, locator ) )[ 0 ];

	return element;
}

export async function elementNotLocated( driver, locator ) {
	const element = ( await findElements( driver, locator ) )[ 0 ];

	return ! element ? true : element;
}

export async function elementLocatedAndVisible( driver, locator ) {
	const element = ( await findElements( driver, locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}
	const isDisplayed = await element.isDisplayed();

	return isDisplayed ? element : null;
}

export async function elementClickable( driver, locator ) {
	const element = ( await findElements( driver, locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}
	const isEnabled = await element.isEnabled();
	const isAriaEnabled = await element.getAttribute( 'aria-disabled' ).then( ( v ) => v !== 'true' );

	return isEnabled && isAriaEnabled ? element : null;
}

export async function elementFocused( driver, locator ) {
	const element = ( await findElements( driver, locator ) )[ 0 ];
	if ( ! element ) {
		return null;
	}
	const elementId = await element.getId();
	const activeElementId = await driver.switchTo().activeElement().getId();
	const isFocused = activeElementId === elementId;

	return isFocused ? element : null;
}

// export async function fieldClearable( driver, locator ) {
// 	const field = ( await findElements( driver, locator ) )[ 0 ];
// 	if ( ! field ) {
// 		return null;
// 	}
// 	await driver.executeScript( "arguments[0].value = '';", field );
// 	await field.clear();
// 	const value = await field.getAttribute( 'value' );

// 	return value === '' ? field : null;
// }

export async function imageVisible( driver, locator ) {
	const image = ( await findElements( driver, locator ) )[ 0 ];
	if ( ! image ) {
		return null;
	}
	const isVisible = await driver.executeScript(
		"return typeof arguments[ 0 ].naturalWidth !== 'undefined' && arguments[ 0 ].naturalWidth > 0;",
		image
	);

	return isVisible ? image : null;
}

export function isElementLocated( driver, locator ) {
	return resolveToBool( elementLocated( driver, locator ) );
}

export function isElementNotLocated( driver, locator ) {
	return resolveToBool( elementNotLocated( driver, locator ) );
}

export function isElementLocatedAndVisible( driver, locator ) {
	return resolveToBool( elementLocatedAndVisible( driver, locator ) );
}

export function isElementClickable( driver, locator ) {
	return resolveToBool( elementClickable( driver, locator ) );
}

export function isElementFocused( driver, locator ) {
	return resolveToBool( elementFocused( driver, locator ) );
}

// export function isFieldClearable( driver, locator ) {
// 	return resolveToBool( fieldClearable( driver, locator ) );
// }

export function isImageVisible( driver, locator ) {
	return resolveToBool( imageVisible( driver, locator ) );
}

const until = {
	...webriver.until,
	elementNotLocated( locator ) {
		const locatorStr = getLocatorString( locator );
		return new WebElementCondition( `for element to NOT be located ${ locatorStr }`, ( driver ) =>
			elementNotLocated( driver, locator )
		);
	},
	elementLocatedAndVisible( locator ) {
		const locatorStr = getLocatorString( locator );
		return new WebElementCondition(
			`for element to be located and visible ${ locatorStr }`,
			( driver ) => elementLocatedAndVisible( driver, locator )
		);
	},

	elementClickable( locator ) {
		const locatorStr = getLocatorString( locator );
		return new WebElementCondition( `for element to be clickable ${ locatorStr }`, ( driver ) =>
			elementClickable( driver, locator )
		);
	},

	elementFocused( locator ) {
		const locatorStr = getLocatorString( locator );
		return new WebElementCondition( `for element to be focused ${ locatorStr }`, ( driver ) =>
			findElementIfFocused( driver, locator )
		);
	},

	// FieldClearable( locator ) {
	// 	const locatorStr = getLocatorString( locator );
	// 	return new WebElementCondition( `for field to be clearable ${ locatorStr }`, ( driver ) =>
	// 		resolveToValue( findFieldIfClearable( driver, locator ) )
	// 	);
	// }

	imageVisible( locator ) {
		const locatorStr = getLocatorString( locator );
		return new WebElementCondition( `for image to be visible ${ locatorStr }`, ( driver ) =>
			imageVisible( driver, locator )
		);
	},

	numberOfWindowsOpen( number ) {
		return new WebElementCondition( `for ${ number } of windows to be open`, async ( driver ) => {
			const handles = await driver.getAllWindowHandles();
			return handles.length === number ? handles : null;
		} );
	},

	allWindowsClosed() {
		return new WebElementCondition( 'for all windows to be closed', async ( driver ) => {
			try {
				const handles = await driver.getAllWindowHandles();

				if ( handles.length === 1 ) {
					await closeCurrentWindow( driver );
				} else if ( handles.length > 1 ) {
					for ( let i = handles.length - 1; i >= 0; i-- ) {
						await switchToWindowByIndex( driver, i );
						await closeCurrentWindow( driver );
					}
				}
				return handles;
			} catch {
				return null;
			}
		} );
	},
};

export function waitUntilElementLocated( driver, locator, timeout ) {
	const locatorStr = getLocatorString( locator );

	return driver.wait( until.elementLocated(locator)	);
}

function waitUntilAllWindowsClosed( driver, timeout ) {
	return driver.wait(
		new WebElementCondition( 'for all windows to be closed', async () => {
			try {
				const handles = await driver.getAllWindowHandles();

				if ( handles.length === 1 ) {
					await closeCurrentWindow( driver );
				} else if ( handles.length > 1 ) {
					for ( let i = handles.length - 1; i >= 0; i-- ) {
						await switchToWindowByIndex( driver, i );
						await closeCurrentWindow( driver );
					}
				}
				return handles;
			} catch {
				return null;
			}
		} ),
		timeout
	);
}
