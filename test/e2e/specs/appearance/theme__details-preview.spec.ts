import {
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	SidebarComponent,
	ThemesPage,
	ThemesDetailPage,
	PreviewComponent,
	SiteSelectComponent,
} from '@automattic/calypso-e2e';
import { test } from '@playwright/test';

test.describe( 'Themes', () => {
	test( 'Preview', async ( { page } ) => {
		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = new TestAccount( accountName );
		const testAccountSiteDomain = testAccount.getSiteURL( { protocol: false } );
		let themesPage: ThemesPage;
		let themesDetailPage: ThemesDetailPage;
		let previewComponent: PreviewComponent;

		// This test will use partial matching names to cycle between available themes.
		const themeName = 'Twenty Twen';

		await testAccount.authenticate( page );

		await test.step( 'Navigate to Appearance > Themes', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Appearance', 'Themes' );
		} );

		await test.step( `Choose test site ${ testAccountSiteDomain } if Site Selector is shown`, async function () {
			const siteSelectComponent = new SiteSelectComponent( page );

			if ( await siteSelectComponent.isSiteSelectorVisible() ) {
				await siteSelectComponent.selectSite( testAccountSiteDomain );
			}
		} );

		await test.step( `Search for theme with keyword ${ themeName }`, async function () {
			themesPage = new ThemesPage( page );
			await themesPage.search( themeName );
		} );

		await test.step( `Select and view details of a theme starting with ${ themeName }`, async function () {
			const selectedTheme = await themesPage.select( themeName );
			await themesPage.hoverThenClick( selectedTheme );
		} );

		await test.step( 'Preview theme', async function () {
			themesDetailPage = new ThemesDetailPage( page );
			await themesDetailPage.preview();
			previewComponent = new PreviewComponent( page );
			await previewComponent.previewReady();
		} );

		await test.step( 'Close theme preview', async function () {
			await previewComponent.closePreview();
		} );
	} );
} );
