/**
 * @group i18n
 */

import { setupHooks, DataHelper, BrowserHelper } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const locale = BrowserHelper.getLocale();

describe( `Logged out homepage redirect test @i18n (${ locale })`, function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( `Redirect to correct URL for wordpress.com (${ locale })`, async function () {
		await page.goto( DataHelper.getCalypsoURL() );

		// Locale slug for English is not included in the path name.
		const localePath = locale === 'en' ? '' : `${ locale }/`;
		await page.waitForURL( DataHelper.getCalypsoURL( localePath ) );
	} );
} );
