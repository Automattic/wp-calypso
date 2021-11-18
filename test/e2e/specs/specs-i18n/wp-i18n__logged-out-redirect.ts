/**
 * @group i18n
 */

import { setupHooks, DataHelper, TestEnvironment, BrowserManager } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( 'I18N: Homepage Redirect', function () {
	setupHooks( ( args: { page: Page } ) => {
		args.page;
	} );

	it.each( TestEnvironment.LOCALES() )( 'Homepage Redirect (%s)', async function ( locale ) {
		// Launch a new BrowserContext with the custom locale specified.
		const browserContext = await BrowserManager.newBrowserContext( { locale: locale } );
		const testPage = await browserContext.newPage();

		await testPage.goto( DataHelper.getCalypsoURL() );

		// Locale slug for English is not included in the path name.
		const localePath = locale === 'en' ? '' : `${ locale }/`;
		await testPage.waitForURL( DataHelper.getCalypsoURL( localePath ) );

		// Close the test context.
		await browserContext.close();
	} );
} );
