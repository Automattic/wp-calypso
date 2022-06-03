import { Locator } from 'playwright';

/**
 * Translate string by evaluating the `wp.i18n__` translate function from the page.
 */
export async function translateFromPage( locator: Locator, string: string ): Promise< string > {
	return (
		locator.evaluate(
			// eslint-disable-next-line @wordpress/i18n-no-variables
			( _el, string ) => ( window as any )?.wp?.i18n?.__( string ),
			string
		) || Promise.resolve( string )
	);
}
