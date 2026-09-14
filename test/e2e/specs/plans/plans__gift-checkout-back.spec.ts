import { DataHelper, TestAccount } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import type { Page } from '@playwright/test';

type BackChoice = 'Save cart' | 'Empty cart';

const BACK_CHOICES: BackChoice[] = [ 'Save cart', 'Empty cart' ];

// The banner links to production checkout no matter which Calypso is under
// test, so the click is followed on CALYPSO_BASE_URL instead. A redirect keeps
// the gifted site as the referrer, which is what Back navigates to.
const PRODUCTION_CHECKOUT_URL = /^https:\/\/wordpress\.com\/checkout\//;

// The site owner cannot gift their own plan ("You cannot gift subscriptions to
// yourself"), so the logged-in gifter is a different account than the owner.
const GIFTED_SITE_OWNER = 'defaultUser';
const LOGGED_IN_GIFTER = 'simpleSiteFreePlanUser';

async function redirectProductionCheckoutToCalypso( page: Page ): Promise< void > {
	const calypsoOrigin = new URL( DataHelper.getCalypsoURL( '/' ) ).origin;
	await page.route( PRODUCTION_CHECKOUT_URL, ( route ) => {
		const url = new URL( route.request().url() );
		if ( url.origin === calypsoOrigin ) {
			return route.continue();
		}
		return route.fulfill( {
			status: 302,
			headers: { location: DataHelper.getCalypsoURL( url.pathname + url.search ) },
		} );
	} );
}

async function openGiftCheckoutFromSite( page: Page, siteUrl: string ): Promise< void > {
	await redirectProductionCheckoutToCalypso( page );
	await page.goto( siteUrl );
	await page.getByRole( 'button', { name: 'Gift', exact: true } ).click();
	await expect( page ).toHaveURL( /\/checkout\/[^/]+\/gift\// );
}

function backButton( page: Page ) {
	return page
		.getByRole( 'button', { name: 'Back', exact: true } )
		.filter( { visible: true } )
		.first();
}

async function goBackFromCheckout( page: Page, choice: BackChoice ): Promise< void > {
	// The gifted site is read from the cart's gift_details, so Back must not be
	// clicked until the cart has loaded. Building a gift cart takes the store
	// several seconds.
	await expect( page.locator( '.checkout-line-item[data-e2e-product-slug]' ).first() ).toBeVisible(
		{ timeout: 30_000 }
	);
	await backButton( page ).click();
	await page.getByRole( 'button', { name: choice, exact: true } ).click();
}

test.describe( 'Plans: Gift checkout Back navigation', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	const owner = new TestAccount( GIFTED_SITE_OWNER );
	const siteUrl = owner.getSiteURL( { protocol: true } );
	const siteSlug = owner.getSiteURL( { protocol: false } );
	const siteOrigin = new URL( siteUrl ).origin;
	let previousGiftingSetting: unknown;

	// The gifting banner setting and the gifter's siteless cart are shared server
	// state, so this file runs in a single worker: the banner is enabled once and
	// restored after the last test, and the logged-in tests run in order so one
	// cannot empty the cart while the other is mid-checkout.
	test.describe.configure( { mode: 'default' } );

	test.beforeAll( async () => {
		const { settings } = await owner.restAPI.getSiteSettings( siteSlug );
		previousGiftingSetting = settings.wpcom_gifting_subscription;
		await owner.restAPI.setSiteSettings( siteSlug, { wpcom_gifting_subscription: true } );
	} );

	test.afterAll( async () => {
		if ( previousGiftingSetting === false ) {
			await owner.restAPI.setSiteSettings( siteSlug, { wpcom_gifting_subscription: false } );
		}
	} );

	test.describe( 'Logged-in gifter', () => {
		// A saved cart is emptied afterwards so it does not leak into every later
		// siteless checkout of the shared account.
		test.afterEach( async () => {
			await new TestAccount( LOGGED_IN_GIFTER ).restAPI.clearMyShoppingCart( 'no-site' );
		} );

		for ( const choice of BACK_CHOICES ) {
			test( `As a logged-in user, I can go back from gift checkout to the gifted site after choosing "${ choice }"`, async ( {
				accountSimpleSiteFreePlan,
				page,
			} ) => {
				await test.step( 'When I click Gift in the banner on the site', async function () {
					await accountSimpleSiteFreePlan.authenticate( page );
					await openGiftCheckoutFromSite( page, siteUrl );
				} );

				await test.step( `And I click Back and choose "${ choice }"`, async function () {
					await goBackFromCheckout( page, choice );
				} );

				await test.step( 'Then I land on the gifted site', async function () {
					await expect( page ).toHaveURL(
						( url ) => url.origin === siteOrigin && url.pathname === '/'
					);
				} );
			} );
		}
	} );

	test.describe( 'Logged-out visitor', () => {
		test( 'As a logged-out visitor, I can go back from gift checkout as soon as Back is available', async ( {
			pageIncognito,
		} ) => {
			const page = pageIncognito.getPage();

			await test.step( 'When I click Gift in the banner on the site', async function () {
				await openGiftCheckoutFromSite( page, siteUrl );
			} );

			await test.step( 'And I click Back the moment it becomes available', async function () {
				// Back stays disabled until the cart has been round-tripped to the
				// server, because the gifted site's URL only arrives with it. The
				// earliest a visitor can act on the control is therefore the earliest
				// it is safe to, no matter how fast they click.
				await expect( backButton( page ) ).toBeEnabled( { timeout: 30_000 } );
				await backButton( page ).click();
				await page.getByRole( 'button', { name: 'Save cart', exact: true } ).click();
			} );

			await test.step( 'Then I land on the gifted site', async function () {
				await expect( page ).toHaveURL(
					( url ) => url.origin === siteOrigin && url.pathname === '/'
				);
			} );
		} );

		for ( const choice of BACK_CHOICES ) {
			test( `As a logged-out visitor, I can go back from gift checkout to the gifted site after choosing "${ choice }"`, async ( {
				pageIncognito,
			} ) => {
				const page = pageIncognito.getPage();

				await test.step( 'When I click Gift in the banner on the site', async function () {
					await openGiftCheckoutFromSite( page, siteUrl );
				} );

				await test.step( `And I click Back and choose "${ choice }"`, async function () {
					await goBackFromCheckout( page, choice );
				} );

				await test.step( 'Then I land on the gifted site', async function () {
					await expect( page ).toHaveURL(
						( url ) => url.origin === siteOrigin && url.pathname === '/'
					);
				} );
			} );
		}
	} );
} );
