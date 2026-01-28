import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Domain: Upsell (Home)',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		test( 'As a user, I can see domain upsell on Home dashboard and proceed to checkout', async ( {
			helperData,
			page,
			pageMyHome,
			pagePlans,
			sitePublic,
		} ) => {
			let suggestedDomain: string;

			await test.step( 'When I navigate to the Home dashboard on a new Free public site', async function () {
				await page.goto(
					helperData.getCalypsoURL( `/home/${ sitePublic.blog_details.site_slug }` )
				);
			} );

			await test.step( 'And domain upsell card has a suggested domain', async function () {
				suggestedDomain = await pageMyHome.getSuggestedUpsellDomain();
				expect( suggestedDomain ).not.toBe( '' );
			} );

			await test.step( 'When I click to begin searching for a domain', async function () {
				await pageMyHome.clickButton( 'Get this domain' );
			} );

			await test.step( 'And I choose the Personal plan', async function () {
				await pagePlans.selectPlan( 'Personal' );
			} );

			await test.step( 'Then the secure checkout page displays', async function () {
				await page.waitForURL( /checkout/ );
			} );
		} );
	}
);
