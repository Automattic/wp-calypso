/**
 * @group calypso-pr
 */

import { setupHooks, DataHelper, LoginPage } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Stats' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe.each`
		siteType      | user
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'wooCommerceUser' }
	`( 'View Insights ($siteType)', function ( { user } ) {
		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
			await page.click( 'a[data-tip-target="me"]' );
			await page.waitForSelector( 'h1:text("My Profile")' );
		} );
	} );

	it( 'Log in with rejection', async function () {
		const loginPage = new LoginPage( page );
		await expect(
			loginPage.login( {
				username: 'a11ne2eflowtestingdomainonly1633711161507.6ob24pgn@mailosaur.io',
				password: 'lkjwlerjwe',
			} )
		).rejects.toThrow();
	} );
} );
