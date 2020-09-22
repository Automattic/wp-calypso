/**
 * External dependencies
 */
const { visitAdminPage } = require( '@wordpress/e2e-test-utils' );

export async function activateTheme( themeSlug ) {
	await visitAdminPage( 'themes.php' );
	const wrapperSelector = `div[data-slug="${ themeSlug }"]`;
	const theme = await page.$( wrapperSelector );
	if ( ! theme ) {
		throw new Error( `The theme ${ themeSlug } is not installed on the test site!` );
	}
	const activateLink = await page.$( `${ wrapperSelector } a.activate` );
	// It is already active.
	if ( ! activateLink ) {
		return;
	}
	await page.click( `${ wrapperSelector } a.activate` );
}
