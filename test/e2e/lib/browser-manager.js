/**
 * External dependencies
 */
import playwright from 'playwright';

export function targetScreenSize() {
	let target = process.env.BROWSERSIZE;
	if ( target === undefined || target === '' ) {
		target = 'desktop';
	}
	return target.toLowerCase();
}

export function getScreenResolutionFromString() {
	switch ( targetScreenSize() ) {
		case 'mobile':
			return { width: 400, height: 1000 };
		case 'tablet':
			return { width: 1024, height: 1000 };
		case 'desktop':
			return { width: 1440, height: 1000 };
		case 'laptop':
			return { width: 1400, height: 790 };
		default:
			throw new Error(
				'Unsupported screen size specified. Supported values are desktop, tablet and mobile.'
			);
	}
}

export async function startBrowser( { useCustomUA = true, resizeBrowserWindow = true } = {} ) {
	if ( global.__BROWSER__ ) {
		return global.__BROWSER__;
	}

	let isHeadless = true;
	if ( ! process.env.HEADLESS || ! config.has( 'headless' ) ) {
		isHeadless = false;
	}
	global.isHeadless = isHeadless;

	const browser = await playwright.chromium.launch( { headless: isHeadless } );
	// const userAgent = `user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ browser.version() } Safari/537.36`;
	const screenDimensions = getScreenResolutionFromString();

	const browserContext = await browser.newContext( {
		viewport: { width: screenDimensions.width, height: screenDimensions.height },
	} );

	// Set the browser instance to the global object's attribute.
	global.__BROWSER__ = browser;
	global.__PLAYWRIGHT__ = true;
	const page = await browserContext.newPage();
	return page;
}

export function quitBrowser() {
	const browser = global.__BROWSER__;
	// Remove browser instance from global object.
	global.__BROWSER__ = null;
	// Close browser instance.
	browser.close();
}
