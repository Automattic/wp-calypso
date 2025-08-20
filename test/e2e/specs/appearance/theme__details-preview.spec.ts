import { test } from '../../lib/pw_base';

test.describe( 'Themes', () => {
	test( 'Preview (Gutenberg Simple Account)', async ( {
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

		await test.step( `Authenticate as '${ accountGutenbergSimple.accountName }'`, async function () {
			await accountGutenbergSimple.authenticate( page );
		} );

		await test.step( 'Navigate to Appearance > Themes', async function () {
			await componentSidebar.navigate( 'Appearance', 'Themes' );
		} );

		await test.step( `Choose test site ${ testAccountSiteDomain } if Site Selector is shown`, async function () {
			if ( await componentSiteSelect.isSiteSelectorVisible() ) {
				await componentSiteSelect.selectSite( testAccountSiteDomain );
			}
		} );

		await test.step( `Search for theme with keyword ${ themeName }`, async function () {
			await pageThemes.search( themeName );
		} );

		await test.step( `Select and view details of a theme starting with ${ themeName }`, async function () {
			const selectedTheme = await pageThemes.select( themeName );
			await pageThemes.hoverThenClick( selectedTheme );
		} );

		await test.step( 'Preview theme', async function () {
			await pageThemeDetails.preview();
			await componentPreview.previewReady();
		} );

		await test.step( 'Close theme preview', async function () {
			await componentPreview.closePreview();
		} );
	} );
} );
