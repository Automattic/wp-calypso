/**
 * @group i18n
 */

import { DataHelper, envVariables } from '@automattic/calypso-e2e';
import { Browser } from 'playwright';

declare const browser: Browser;

describe( 'I18N: Homepage Redirect', function () {
	it.each( envVariables.TEST_LOCALES as ReadonlyArray< string > )(
		'Homepage Redirect (%s)',
		async function ( locale ) {
			// Launch a new BrowserContext with the custom locale specified.
			const page = await browser.newPage( { locale: locale } );

			await page.goto( DataHelper.getCalypsoURL() );

			// Locale slug for English is not included in the path name.
			const localePath = locale === 'en' ? '' : `${ locale }/`;
			await page.waitForURL( DataHelper.getCalypsoURL( localePath ) );
			await page.close();
		}
	);
} );

describe( 'I18N: Plans Page Redirect', function () {
	it.each( envVariables.TEST_LOCALES as ReadonlyArray< string > )(
		'Plans Page Redirect (%s)',
		async function ( locale ) {
			// Launch a new BrowserContext with the custom locale specified.
			const page = await browser.newPage( { locale: locale } );
			// Locale slug for English is not included in the path name.
			const localePath = locale === 'en' ? '' : `${ locale }/`;

			await page.goto( DataHelper.getCalypsoURL( `${ localePath }plans/` ) );
			await page.waitForURL( DataHelper.getCalypsoURL( `${ localePath }pricing/` ) );
			await page.close();
		}
	);
} );
