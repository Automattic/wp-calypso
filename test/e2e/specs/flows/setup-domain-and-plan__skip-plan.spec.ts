import { tags, test } from '../../lib/pw-base';

test.describe( 'Domain: Upsell (Skip Plan)', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	test( 'As a user with a qualifying yearly plan, I skip plan selection and go directly to checkout', async ( {
		accountAtomic,
		componentDomainSearch,
		helperData,
		page,
		pageCartCheckout,
	} ) => {
		let selectedDomain: string;
		const siteSlug = accountAtomic.getSiteURL( { protocol: false } );
		const siteId = accountAtomic.credentials.testSites?.primary?.id as number;

		await test.step( 'Given I clear any stale cart items', async function () {
			await accountAtomic.restAPI.clearShoppingCart( siteId );
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

		await test.step( 'And the cart contains only the domain (no plan)', async function () {
			await pageCartCheckout.validateCartItemsCount( 1 );
		} );
	} );
} );
