import { Page, Frame } from 'playwright';

/**
 * Translate string by evaluating the `wp.i18n__` translate function from the page.
 */
export async function translateFromPage( frame: Page | Frame, string: string ): Promise< string > {
	return (
		frame.evaluate(
			// eslint-disable-next-line @wordpress/i18n-no-variables
			( string ) => ( window as any )?.wp?.i18n?.__( string ),
			string
		) || Promise.resolve( string )
	);
}
