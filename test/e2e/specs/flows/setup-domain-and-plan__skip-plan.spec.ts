import { skipIfNotTrunk, tags, test } from '../../lib/pw-base';

// Desktop only: the desktop and mobile projects share this account and its
// site cart, so two runs of this spec at once write over each other's cart.
//
// The cart is not cleared first on purpose. A clear deletes the saved cart,
// and a cart read in the seconds after that can still return the old
// products, which made the first suggestion render as "Continue". Nothing
// here needs an empty cart: the search uses a fresh domain name each run, and
// the checkout assertions only look for that domain and for the absence of a
// plan.
test.describe(
	'Domain: Upsell (Skip Plan)',
	{ tag: [ tags.CALYPSO_RELEASE, tags.DESKTOP_ONLY ] },
	() => {
		skipIfNotTrunk();

		test( 'As a user with a qualifying yearly plan, I skip plan selection and go directly to checkout', async ( {
			accountAtomic,
			componentDomainSearch,
			helperData,
			page,
			pageCartCheckout,
		} ) => {
			let selectedDomain: string;
			const siteSlug = accountAtomic.getSiteURL( { protocol: false } );

			await test.step( `And I am authenticated as '${ accountAtomic.accountName }'`, async function () {
				await accountAtomic.authenticate( page );
			} );

			await test.step( 'When I navigate to the domain-and-plan flow', async function () {
				await page.goto(
					helperData.getCalypsoURL( `/setup/domain-and-plan?siteSlug=${ siteSlug }` )
				);
			} );

			await test.step( 'And I search for a domain name', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
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
