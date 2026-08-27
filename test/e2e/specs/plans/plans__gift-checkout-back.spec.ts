import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import type { Page } from '@playwright/test';

async function getGiftCheckoutUrl( account: TestAccount ): Promise< string > {
	const siteSlug = account.getSiteURL( { protocol: false } );
	const purchases = await account.restAPI.getAllPurchases( siteSlug );
	const plan = purchases.find(
		( purchase ) =>
			purchase.product_slug.includes( 'bundle' ) && ! purchase.product_slug.includes( 'trial' )
	);
	expect( plan, `No plan purchase found on ${ siteSlug }` ).toBeTruthy();
	if ( ! plan ) {
		throw new Error( `No plan purchase found on ${ siteSlug }` );
	}
	return DataHelper.getCalypsoURL( `checkout/${ plan.product_slug }/gift/${ plan.ID }`, {
		cancel_to: '/home',
	} );
}

async function goBackFromCheckout( page: Page ): Promise< void > {
	// The gifted site is read from the cart's gift_details, so Back must not be
	// clicked until the cart has loaded.
	await expect(
		page.locator( '.checkout-line-item[data-e2e-product-slug]' ).first()
	).toBeVisible();
	await page
		.getByRole( 'button', { name: 'Back', exact: true } )
		.filter( { visible: true } )
		.first()
		.click();
	await page.getByRole( 'button', { name: 'Empty cart' } ).click();
}

test.describe( 'Plans: Gift checkout Back navigation', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	test( 'As a logged-in user, I can go back from gift checkout to the gifted site', async ( {
		accountDefaultUser,
		page,
	} ) => {
		const siteUrl = accountDefaultUser.getSiteURL( { protocol: true } );
		const siteOrigin = new URL( siteUrl ).origin;
		let giftCheckoutUrl = '';

		await test.step( 'Given the site has a plan subscription that can be gifted', async function () {
			giftCheckoutUrl = await getGiftCheckoutUrl( accountDefaultUser );
		} );

		await test.step( 'When I open gift checkout from the site and click Back', async function () {
			await accountDefaultUser.authenticate( page );
			await page.goto( giftCheckoutUrl, { referer: siteUrl } );
			await goBackFromCheckout( page );
		} );

		await test.step( 'Then I land on the gifted site', async function () {
			await expect( page ).toHaveURL(
				( url ) => url.origin === siteOrigin && url.pathname === '/'
			);
		} );
	} );

	test( 'As a logged-out visitor, I can go back from gift checkout to the gifted site', async ( {
		pageIncognito,
	} ) => {
		const account = new TestAccount( 'defaultUser' );
		const siteUrl = account.getSiteURL( { protocol: true } );
		const siteOrigin = new URL( siteUrl ).origin;
		const page = pageIncognito.getPage();
		let giftCheckoutUrl = '';

		await test.step( 'Given the site has a plan subscription that can be gifted', async function () {
			giftCheckoutUrl = await getGiftCheckoutUrl( account );
		} );

		await test.step( 'When I open gift checkout from the site and click Back', async function () {
			await page.goto( giftCheckoutUrl, { referer: siteUrl } );
			await goBackFromCheckout( page );
		} );

		await test.step( 'Then I land on the gifted site', async function () {
			await expect( page ).toHaveURL(
				( url ) => url.origin === siteOrigin && url.pathname === '/'
			);
		} );
	} );
} );
