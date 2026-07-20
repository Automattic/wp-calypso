import { expect, skipIfMailosaurLimitReached, skipIfNotTrunk, tags, test } from '../../lib/pw-base';

test.describe(
	'Domain: Upsell (Home)',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		skipIfNotTrunk();
		skipIfMailosaurLimitReached();

		test( 'As a user, I can see domain upsell on Home dashboard and proceed to checkout', async ( {
			helperData,
			page,
			pageMyHome,
			pagePlans,
			sitePublic,
		} ) => {
			await test.step( 'When I navigate to the Home dashboard on a new Free public site', async function () {
				await page.goto(
					helperData.getCalypsoURL( `/home/${ sitePublic.blog_details.site_slug }` )
				);
			} );

			await test.step( 'And domain upsell card has a suggested domain', async function () {
				// The suggestion API can be slow on CI, hence the raised timeout.
				await expect( pageMyHome.suggestedUpsellDomainName ).toHaveText( /\S+\.\S+/, {
					timeout: 60_000,
				} );
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
