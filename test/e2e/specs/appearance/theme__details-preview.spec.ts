import { test } from '../../lib/pw_base';

test.describe( 'Appearance: Theme Details Preview', () => {
	test( 'As a gutenberg simple site user, I can preview a different theme on my site', async ( {
		page,
		accountGutenbergSimple,
		componentSidebar,
		componentSiteSelect,
		pageThemes,
		pageThemeDetails,
		componentPreview,
	} ) => {
		const testAccountSiteDomain = accountGutenbergSimple.getSiteURL( { protocol: false } );

		// This test will use partial matching names to cycle between available themes.
		const themeName = 'Twenty Twen';

		await test.step( `Given I am authenticated as '${ accountGutenbergSimple.accountName }'`, async function () {
			await accountGutenbergSimple.authenticate( page );
		} );

		await test.step( 'When I navigate to Appearance > Themes', async function () {
			await componentSidebar.navigate( 'Appearance', 'Themes' );
		} );

		await test.step( `And I choose the test site ${ testAccountSiteDomain } if the site selector is shown`, async function () {
			if ( await componentSiteSelect.isSiteSelectorVisible() ) {
				await componentSiteSelect.selectSite( testAccountSiteDomain );
			}
		} );

		await test.step( `And I search for a theme with my keyword ${ themeName }`, async function () {
			await pageThemes.search( themeName );
		} );

		await test.step( `And I select and view details of a theme starting with ${ themeName }`, async function () {
			const selectedTheme = await pageThemes.select( themeName );
			await pageThemes.hoverThenClick( selectedTheme );
		} );

		await test.step( 'Then I can preview the theme', async function () {
			await pageThemeDetails.preview();
			await componentPreview.previewReady();
		} );

		await test.step( 'And I can close the theme preview', async function () {
			await componentPreview.closePreview();
		} );
	} );
} );
