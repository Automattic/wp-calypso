import { DomainsPage } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Domains: Add to current site',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		test( 'As a user, I can add a domain to my existing site', async ( {
			componentDomainSearch,
			componentSidebar,
			helperData,
			page,
			pageCartCheckout,
			sitePublic,
			viewportName,
		} ) => {
			let selectedDomain: string;

			await test.step( 'When I navigate to Upgrades > Domains', async function () {
				await page.goto(
					helperData.getCalypsoURL( `/home/${ sitePublic.blog_details.site_slug }` )
				);
				await componentSidebar.navigate( 'Upgrades', 'Domains' );
			} );

			await test.step( 'And I add a domain to the site', async function () {
				const domainsPage = new DomainsPage( page );
				if ( viewportName === 'mobile' ) {
					await domainsPage.clickSearchForDomain(); // Add domain button is hidden on mobile
				} else {
					await domainsPage.addDomain();
				}
			} );

			await test.step( 'And I choose the first suggestion', async function () {
				componentDomainSearch.container = page.getByRole( 'main' );
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
				expect( selectedDomain ).not.toBe( '' );
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
			} );

			await test.step( 'And I decline Titan Email upsell', async function () {
				await componentDomainSearch.skipDomainEmailUpsell();
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
