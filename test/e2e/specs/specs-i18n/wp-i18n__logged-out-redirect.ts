/**
 * @group i18n
 */

import { setupHooks, DataHelper, TestEnvironment } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe.skip( 'I18N: Homepage Redirect', function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it.each( TestEnvironment.LOCALES() )( 'Locale: %s', async function ( locale ) {
		await page.goto( DataHelper.getCalypsoURL() );

		// Locale slug for English is not included in the path name.
		const localePath = locale === 'en' ? '' : `${ locale }/`;
		await page.waitForURL( DataHelper.getCalypsoURL( localePath ) );
	} );
} );
