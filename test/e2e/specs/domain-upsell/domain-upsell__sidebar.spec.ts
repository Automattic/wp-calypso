import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Domain: Upsell (Sidebar)', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	const planName = 'Premium';

	test( `As a user, I can use the sidebar domain upsell to add a domain and a ${ planName } plan to cart`, async ( {
		componentDomainSearch,
		componentSidebar,
		helperData,
		page,
		pageCartCheckout,
		pagePlans,
		sitePublic,
	} ) => {
		let selectedDomain: string;

		await test.step( 'When I navigate to the Home dashboard on a new Free public site', async function () {
			await page.goto( helperData.getCalypsoURL( `/home/${ sitePublic.blog_details.site_slug }` ) );
		} );

		await test.step( 'And I open the sidebar Domain Upsell notice', async function () {
			await componentSidebar.openNotice(
				'Upgrade',
				`**/setup/domain-and-plan?siteSlug=${ sitePublic.blog_details.site_slug }`
			);
		} );

		await test.step( 'And I search for a domain name', async function () {
			await componentDomainSearch.search( `${ sitePublic.blog_details.site_slug }.com` );
		} );

		await test.step( 'And I choose the first suggestion and continue', async function () {
			selectedDomain = await componentDomainSearch.selectFirstSuggestion();
			expect( selectedDomain ).not.toBe( '' );
			await componentDomainSearch.continue();
		} );

		await test.step( `And I choose the WordPress.com ${ planName } plan`, async function () {
			await pagePlans.selectPlan( planName );
		} );

		await test.step( `Then WordPress.com ${ planName } is added to cart`, async function () {
			await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
		} );

		await test.step( 'And I see the selected domain in checkout', async function () {
			await pageCartCheckout.validateCartItem( selectedDomain );
		} );
	} );
} );
