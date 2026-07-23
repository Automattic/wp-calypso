import { DataHelper } from '@automattic/calypso-e2e';
import {
	expect,
	skipIfMailosaurLimitReached,
	/* skipIfNotTrunk, */ tags,
	test,
} from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Domains: Add to current site' ),
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		// skipIfNotTrunk();
		skipIfMailosaurLimitReached();

		test( 'As a user, I can add a domain to my existing site', async ( {
			componentDomainSearch,
			componentSidebar,
			helperData,
			page,
			pageCartCheckout,
			pageDashboardSiteDomains,
			pageSignupPickPlan,
			sitePublic,
		} ) => {
			let selectedDomain: string;

			await test.step( 'When I navigate to Upgrades > Domains', async function () {
				await page.goto(
					helperData.getCalypsoURL( `/home/${ sitePublic.blog_details.site_slug }` )
				);
				await componentSidebar.navigate( 'Upgrades', 'Domains' );
			} );

			await test.step( 'And I start a search for a new domain', async function () {
				await pageDashboardSiteDomains.searchForNewDomain();
			} );

			await test.step( 'And I choose the first suggestion', async function () {
				// The stepper has no `main` landmark, and the page carries unrelated list items,
				// so we need scoping.
				componentDomainSearch.container = page.locator( '.domain-search' );
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
				expect( selectedDomain ).not.toBe( '' );
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
			} );

			await test.step( 'And I continue with the free plan', async function () {
				await pageSignupPickPlan.selectEscapeHatchWithoutSiteCreation( 'Free' );
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );

			await test.step( 'And I can remove the domain from cart', async function () {
				await pageCartCheckout.removeCartItem( selectedDomain, false );
			} );
		} );
	}
);
