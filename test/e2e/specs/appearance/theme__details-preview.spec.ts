import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Appearance: Theme Details Preview',
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_REMOTE_SITE ] },
	() => {
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

			// The site uses the Classic interface, where Appearance > Themes is wp-admin's
			// own page and Theme Showcase is Calypso's.
			await test.step( 'When I navigate to Appearance > Theme Showcase', async function () {
				await componentSidebar.navigate( 'Appearance', 'Theme Showcase' );

				// wp-admin links the showcase to production; the build under test must serve it.
				expect( new URL( page.url() ).origin ).toBe( new URL( DataHelper.getCalypsoURL() ).origin );
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
	}
);
