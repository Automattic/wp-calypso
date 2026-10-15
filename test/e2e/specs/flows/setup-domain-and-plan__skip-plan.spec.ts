import { expect, skipIfNotTrunk, tags, test } from '../../lib/pw-base';

// Desktop only: the desktop and mobile projects share this account and its
// site cart, so two runs of this spec at once write over each other's cart.
//
// Each run adds a fresh domain to the site cart, and wpcom caps a cart at
// SHOPPING_CART_LIMIT items, so the run removes its own domain afterwards.
// It removes by the searched keyword rather than by the selected domain: the
// selection can add the domain and then fail before returning its name.
// The cart is not cleared first: a cart read in the seconds after a clear can
// still return the old products, which made the first suggestion render as
// "Continue".

// wpcom's SHOPPING_CART_LIMIT: an add is rejected with `cart-full` once the
// cart would reach it.
const SHOPPING_CART_LIMIT = 50;

// A read in the seconds after a cart write can still return the old cart.
const CART_CLEANUP_TIMEOUT_MS = 30 * 1000;

test.describe(
	'Domain: Upsell (Skip Plan)',
	{ tag: [ tags.CALYPSO_RELEASE, tags.DESKTOP_ONLY ] },
	() => {
		skipIfNotTrunk();

		let searchedKeyword: string | undefined;

		// An afterEach rather than a finally: it still runs when the test times out.
		test.afterEach( async ( { accountAtomic } ) => {
			if ( ! searchedKeyword ) {
				return;
			}

			const keyword = searchedKeyword;
			const siteId = accountAtomic.credentials.testSites?.primary.id as number;

			await accountAtomic.restAPI.removeCartProducts( siteId, keyword );

			await expect
				.poll(
					async () => {
						const cart = await accountAtomic.restAPI.getShoppingCart( siteId );
						return cart.products.some( ( product ) => product.meta?.includes( keyword ) );
					},
					{ timeout: CART_CLEANUP_TIMEOUT_MS }
				)
				.toBe( false );
		} );

		test( 'As a user with a qualifying yearly plan, I skip plan selection and go directly to checkout', async ( {
			accountAtomic,
			componentDomainSearch,
			helperData,
			page,
			pageCartCheckout,
		} ) => {
			let selectedDomain: string;
			searchedKeyword = undefined;
			const siteId = accountAtomic.credentials.testSites?.primary.id as number;
			const siteSlug = accountAtomic.getSiteURL( { protocol: false } );

			await test.step( 'Given the site cart has room for a domain', async function () {
				const { products } = await accountAtomic.restAPI.getShoppingCart( siteId );

				expect(
					products.length + 1,
					`Site ${ siteId } cart is full (${ products.length }/${ SHOPPING_CART_LIMIT } items); wpcom rejects new items with cart-full. Clear it before running this spec.`
				).toBeLessThan( SHOPPING_CART_LIMIT );
			} );

			await test.step( `And I am authenticated as '${ accountAtomic.accountName }'`, async function () {
				await accountAtomic.authenticate( page );
			} );

			await test.step( 'When I navigate to the domain-and-plan flow', async function () {
				await page.goto(
					helperData.getCalypsoURL( `/setup/domain-and-plan?siteSlug=${ siteSlug }` )
				);
			} );

			await test.step( 'And I search for a domain name', async function () {
				searchedKeyword = helperData.getBlogName();
				await componentDomainSearch.search( searchedKeyword );
			} );

			await test.step( 'And I choose the first suggestion and continue', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
				await componentDomainSearch.continue();
			} );

			await test.step( 'Then the plan selection step is skipped', async function () {
				await page.waitForURL( /checkout/ );
			} );

			await test.step( 'And I see the selected domain in the cart', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );

			await test.step( 'And no plan was added to the cart', async function () {
				await pageCartCheckout.validateNoPlanInCart();
			} );
		} );
	}
);
