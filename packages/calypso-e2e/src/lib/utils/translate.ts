import { Locator } from 'playwright';

/**
 * Translate string by evaluating the `wp.i18n__` translate function from the page.
 */
export async function translateFromPage(
	locator: Locator,
	string: string,
	context?: string
): Promise< string > {
	const translated = await locator.evaluate(
		// eslint-disable-next-line @wordpress/i18n-no-variables
		( _el, [ string, context ] ) =>
			context === undefined
				? // eslint-disable-next-line @wordpress/i18n-no-variables
				  ( window as any )?.wp?.i18n?.__( string )
				: // eslint-disable-next-line @wordpress/i18n-no-variables
				  ( window as any )?.wp?.i18n?._x( string, context ),
		[ string, context ]
	);

	// `wp.i18n` is absent until the editor boots, and callers pass the result
	// straight to locators that reject `undefined`.
	return translated ?? string;
}
