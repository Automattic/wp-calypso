import { DataHelper, RestAPIClient } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const escapeRegExp = ( value: string ): string => value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

test.describe( 'Plans: Gift checkout Back navigation', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	test( 'As a visitor, clicking Back in gift checkout returns me to the gifted site', async ( {
		accountDefaultUser,
		page,
		pageIncognito,
	} ) => {
		const siteUrl = accountDefaultUser.getSiteURL( { protocol: true } );
		const siteSlug = accountDefaultUser.getSiteURL( { protocol: false } );
		const siteUrlPattern = new RegExp(
			`^${ escapeRegExp( siteUrl.replace( /\/$/, '' ) ) }/?(?:[?#]|$)`
		);
		let giftCheckoutUrl = '';

		await test.step( 'Given the site has a plan subscription that can be gifted', async function () {
			const restAPIClient = new RestAPIClient( accountDefaultUser.credentials );
			const purchases = await restAPIClient.getAllPurchases( siteSlug );
			const plan = purchases.find( ( purchase ) => purchase.product_slug.includes( 'bundle' ) );
			test.skip( ! plan, `No plan purchase found on ${ siteSlug }` );
			giftCheckoutUrl = DataHelper.getCalypsoURL(
				`checkout/${ plan!.product_slug }/gift/${ plan!.ID }`,
				{ cancel_to: '/home' }
			);
		} );

		await test.step( 'When I open gift checkout from the site while logged in and click Back', async function () {
			await accountDefaultUser.authenticate( page );
			await page.goto( giftCheckoutUrl, { referer: siteUrl } );
			await page.getByRole( 'button', { name: 'Back', exact: true } ).click();
		} );

		await test.step( 'Then I land on the gifted site', async function () {
			await expect( page ).toHaveURL( siteUrlPattern );
		} );

		await test.step( 'When I open gift checkout from the site while logged out and click Back', async function () {
			const incognito = pageIncognito.getPage();
			await incognito.goto( giftCheckoutUrl, { referer: siteUrl } );
			await incognito.getByRole( 'button', { name: 'Back', exact: true } ).click();
		} );

		await test.step( 'Then I land on the gifted site as a logged-out visitor', async function () {
			await expect( pageIncognito.getPage() ).toHaveURL( siteUrlPattern );
		} );
	} );
} );
