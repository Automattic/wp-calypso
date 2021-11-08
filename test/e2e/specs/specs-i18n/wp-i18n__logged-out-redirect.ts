/**
 * @group i18n
 */

import { setupHooks, BrowserHelper } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const WPCOM_HOMEPAGE = 'https://wordpress.com';
const locale = BrowserHelper.getLocale();

describe( `Logged out homepage redirect test @i18n (${ locale })`, function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( `Redirect to correct URL for wordpress.com (${ locale })`, async function () {
		await page.goto( WPCOM_HOMEPAGE );

		const localePath = locale === 'en' ? '' : `${ locale }/`;
		await page.waitForURL( `${ WPCOM_HOMEPAGE }/${ localePath }` );
	} );
} );
