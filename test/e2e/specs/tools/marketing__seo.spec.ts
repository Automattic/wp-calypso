import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Marketing: SEO', { tag: [ tags.CALYPSO_PR ] }, () => {
	test( 'As a WordPress.com business plan user with an atomic site, I can see the SEO settings page', async ( {
		accountAtomic,
		helperData,
		page,
		pageMarketing,
	} ) => {
		const frontPageText = helperData.getRandomPhrase();
		const externalPreviewText = helperData.getRandomPhrase();

		await test.step( `Given I am authenticated as '${ accountAtomic.accountName }'`, async function () {
			await accountAtomic.authenticate( page );
		} );

		await test.step( 'When I visit the Tools > Marketing > Traffic page', async function () {
			await pageMarketing.visitTab( accountAtomic.getSiteURL( { protocol: false } ), 'traffic' );
		} );

		await test.step( 'And I enter and verify SEO page title front page structure ', async function () {
			await pageMarketing.enterPageTitleStructure( 'Front Page', frontPageText );
		} );

		await test.step( 'Then I can validate and preview the text ', async function () {
			await pageMarketing.validatePreviewTextForPageStructureCategory( frontPageText );
		} );

		await test.step( 'When I enter SEO external preview description', async function () {
			await pageMarketing.enterExternalPreviewText( externalPreviewText );
		} );

		await test.step( 'And I open SEO preview', async function () {
			await pageMarketing.clickButton( 'Show Previews' );
		} );

		await test.step( 'Then I can verify the preview for Facebook', async function () {
			await pageMarketing.validateExternalPreview( 'Facebook', externalPreviewText );
		} );
	} );

	test( 'As a WordPress.com free plan user with a simple site, I can see the SEO Settings upsell under Jetpack', async ( {
		accountSimpleSiteFreePlan,
		page,
		pageJetpackTraffic,
	} ) => {
		await test.step( `Given I am authenticated as '${ accountSimpleSiteFreePlan.accountName }'`, async function () {
			await accountSimpleSiteFreePlan.authenticate( page );
		} );

		await test.step( 'When I visit the Jetpack > Traffic page', async function () {
			await pageJetpackTraffic.visit( accountSimpleSiteFreePlan.getSiteURL( { protocol: false } ) );
		} );

		await test.step( 'Then I see the Jetpack Traffic page', async function () {
			await expect( pageJetpackTraffic.trafficHeading ).toBeVisible();
		} );

		await test.step( 'And I see the SEO upsell', async function () {
			await expect( pageJetpackTraffic.seoHeading ).toBeVisible();
			await expect( pageJetpackTraffic.seoUpsellLink ).toBeVisible();
		} );
	} );
} );
