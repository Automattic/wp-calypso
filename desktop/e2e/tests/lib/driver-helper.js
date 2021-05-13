/* eslint-disable jsdoc/check-tag-names */
/** @format */

const webdriver = require( 'selenium-webdriver' );
const { forEach } = require( 'lodash' );

const explicitWaitMS = 20000;
const by = webdriver.By;

exports.highlightElement = async function ( driver, element, color = 'gold' ) {
	if ( process.env.HIGHLIGHT_ELEMENT === 'true' ) {
		return await driver.executeScript(
			`arguments[0].setAttribute('style', 'background: ${ color }; border: 3px solid red;');`,
			element
		);
	}
};

exports.clickWhenClickable = async function (
	driver,
	selector,
	waitOverride = null,
	extraErrorString = null
) {
	const self = this;
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	const extraErrorStringAppend = extraErrorString ? ' ' + extraErrorString : '';

	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				async function ( element ) {
					await self.highlightElement( driver, element );
					await driver.sleep( 300 );
					return element.click().then( function () {
						return true;
					} );
				},
				function () {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be clickable${ extraErrorStringAppend }`
	);
};

exports.waitTillNotPresent = function ( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	const self = this;

	return driver.wait(
		function () {
			return self.isElementPresent( driver, selector ).then( function ( isPresent ) {
				return ! isPresent;
			} );
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to NOT be present`
	);
};

exports.followLinkWhenFollowable = function ( driver, selector, waitOverride ) {
	const self = this;
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				async function ( element ) {
					await self.highlightElement( driver, element );
					return element.getAttribute( 'href' ).then(
						function ( href ) {
							driver.get( href );
							return true;
						},
						function () {
							return false;
						}
					);
				},
				function () {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for link with ${ selector.using } of '${ selector.value }' to be followable`
	);
};

exports.waitTillPresentAndDisplayed = function ( driver, selector, waitOverride ) {
	const self = this;
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				async function ( element ) {
					await self.highlightElement( driver, element, '' );
					await driver.sleep( 300 );
					return element.isDisplayed().then(
						function () {
							return true;
						},
						function () {
							return false;
						}
					);
				},
				function () {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be present and displayed`
	);
};

exports.isEventuallyPresentAndDisplayed = function ( driver, selector, waitOverride ) {
	const self = this;
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver
		.wait( function () {
			return driver.findElement( selector ).then(
				async function ( element ) {
					await self.highlightElement( driver, element, '' );
					return element.isDisplayed().then(
						function () {
							return true;
						},
						function () {
							return false;
						}
					);
				},
				function () {
					return false;
				}
			);
		}, timeoutWait )
		.then(
			( shown ) => {
				return shown;
			},
			() => {
				return false;
			}
		);
};

exports.clickIfPresent = function ( driver, selector, attempts ) {
	const self = this;
	if ( attempts === undefined ) {
		attempts = 1;
	}
	for ( let x = 0; x < attempts; x++ ) {
		driver.findElement( selector ).then(
			async function ( element ) {
				await self.highlightElement( driver, element );
				element.click().then(
					function () {
						return true;
					},
					function () {
						return true;
					}
				);
			},
			function () {
				return true;
			}
		);
	}
};

exports.isElementPresent = async function ( driver, selector ) {
	const elements = await driver.findElements( selector );
	return !! elements.length;
};

exports.getErrorMessageIfPresent = function ( driver ) {
	const errorNoticeTextSelector = by.css( '.notice.is-error .notice__text' );

	return driver.findElement( errorNoticeTextSelector ).then(
		( el ) => {
			return el.getText();
		},
		() => {}
	);
};

exports.checkForConsoleErrors = function ( driver ) {
	driver
		.manage()
		.logs()
		.get( 'browser' )
		.then( function ( logs ) {
			if ( logs.length > 0 ) {
				forEach( logs, ( log ) => {
					// Ignore chrome cast errors in Chrome - http://stackoverflow.com/questions/24490323/google-chrome-cast-sender-error-if-chrome-cast-extension-is-not-installed-or-usi/26095117#26095117
					// Also ignore post message errors - this is a known limitation at present
					// Also ignore 404 errors for viewing sites or posts/pages that are private
					if (
						log.message.indexOf( 'cast_sender.js' ) === -1 &&
						log.message.indexOf( '404' ) === -1 &&
						log.message.indexOf( "Failed to execute 'postMessage' on 'DOMWindow'" ) === -1
					) {
						driver.getCurrentUrl().then( ( url ) => {
							console.log( `Found console error: "${ log.message }" on url '${ url }'` ); // eslint-disable-line no-console
						} );
					}
				} );
			}
		} );
};

exports.closeCurrentWindow = function ( driver ) {
	return driver.close();
};

exports.scrollIntoView = async function ( driver, selector ) {
	const selectorElement = await driver.findElement( selector );

	return await driver.executeScript(
		'arguments[0].scrollIntoView( { block: "center", inline: "center" } )',
		selectorElement
	);
};

exports.setWhenSettable = function (
	driver,
	selector,
	value,
	{ secureValue = false, pauseBetweenKeysMS = 0 } = {}
) {
	const self = this;
	const logValue = secureValue === true ? '*********' : value;
	return driver.wait(
		async function () {
			await self.waitForFieldClearable( driver, selector );
			const element = await driver.findElement( selector );
			await self.highlightElement( driver, element );
			await driver.sleep( 300 );
			if ( pauseBetweenKeysMS === 0 ) {
				await element.sendKeys( value );
			} else {
				for ( let i = 0; i < value.length; i++ ) {
					await driver.sleep( pauseBetweenKeysMS );
					await element.sendKeys( value[ i ] );
				}
			}
			const actualValue = await element.getAttribute( 'value' );
			return actualValue === value;
		},
		explicitWaitMS,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be settable to: '${ logValue }'`
	);
};

exports.waitForFieldClearable = function ( driver, selector ) {
	const self = this;

	return driver.wait(
		function () {
			return driver.findElement( selector ).then(
				async ( element ) => {
					await self.highlightElement( driver, element, '' );
					return element.clear().then(
						function () {
							return element.getAttribute( 'value' ).then( ( value ) => {
								return value === '';
							} );
						},
						function () {
							return false;
						}
					);
				},
				function () {
					return false;
				}
			);
		},
		explicitWaitMS,
		`Timed out waiting for element with ${ selector.using } of '${ selector.value }' to be clearable`
	);
};

exports.selectElementByText = async function ( driver, selector, text ) {
	const element = async () => {
		const allElements = await driver.findElements( selector );
		return await webdriver.promise.filter(
			allElements,
			async ( e ) => ( await e.getText() ) === text
		);
	};
	return await this.clickWhenClickable( driver, element, `while looking for '${ text }'` );
};

exports.clearTextArea = async function ( driver, selector ) {
	const textArea = await driver.findElement( selector );
	const textValue = await textArea.getText();
	let i = textValue.length;
	while ( i > 0 ) {
		await textArea.sendKeys( webdriver.Key.BACK_SPACE );
		i--;
	}
};
