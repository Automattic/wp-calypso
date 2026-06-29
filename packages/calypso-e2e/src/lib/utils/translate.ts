import { Locator } from 'playwright';

/**
 * Translate string by evaluating the `wp.i18n__` translate function from the page.
 */
export async function translateFromPage(
	locator: Locator,
	string: string,
	context?: string
): Promise< string > {
	// Fall back to the original string when `wp.i18n` is not available in the
	// page/frame (the optional chaining below resolves to `undefined`). The
	// fallback must apply to the *resolved* value: `evaluate()` returns a
	// Promise, which is always truthy, so `evaluate() || string` never falls back.
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
	return translated || string;
}
