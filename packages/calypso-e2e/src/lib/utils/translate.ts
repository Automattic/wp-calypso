import { Locator } from 'playwright';

/**
 * Translate string by evaluating the `wp.i18n__` translate function from the page.
 */
export async function translateFromPage(
	locator: Locator,
	string: string,
	context?: string
): Promise< string > {
	return (
		locator.evaluate(
			// eslint-disable-next-line @wordpress/i18n-no-variables
			( _el, [ string, context ] ) =>
				context === undefined
					? // eslint-disable-next-line @wordpress/i18n-no-variables
					  ( window as any )?.wp?.i18n?.__( string )
					: // eslint-disable-next-line @wordpress/i18n-no-variables
					  ( window as any )?.wp?.i18n?._x( string, context ),
			[ string, context ]
		) || Promise.resolve( string )
	);
}
