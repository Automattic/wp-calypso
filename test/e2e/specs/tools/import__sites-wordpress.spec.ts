import path from 'path';
import { expect, tags, test } from '../../lib/pw-base';

const TEST_WORDPRESS_EXPORT_FILE_PATH = path.join(
	__dirname,
	'import-files',
	'wordpress-export-example.xml'
);

test.describe(
	'Site Import: Calypso: WordPress',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ],
		annotation: { type: 'flowchart', description: 'https://flowchart.fun/p/mute-color-normalize' },
	},
	() => {
		test( 'As a New WordPress.com free plan user with a simple site, I can use the "WordPress Run Importer" link on the wp-admin Importers List page to import my content from my WordPress site', async ( {
			pageImportContentFromWordPress,
			sitePublic,
		} ) => {
			await test.step( 'When I visit the WordPress importer as coming from the wp-admin Tools > Import page', async function () {
				await pageImportContentFromWordPress.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the Import content from WordPress page', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid WordPress export file', async function () {
				await pageImportContentFromWordPress.importFileContentPage.uploadExportFile(
					TEST_WORDPRESS_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
				await expect(
					pageImportContentFromWordPress.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromWordPress.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromWordPress.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'As a New WordPress.com free plan user with a simple site, I can use the "WordPress.com Run Importer" link on the wp-admin Importers List page to import my content from my WordPress site', async ( {
			pageImportContentFromWordPress,
			pageImportLetsFindYourSite,
			pageImportContent,
			pageImportContentWordpressQuestion,
			sitePublic,
		} ) => {
			const wordpressSiteURL = 'https://test.wordpress.com/';

			await test.step( 'When I visit the "Import Content" page for my new site', async function () {
				await pageImportContent.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the "Import Content" Calypso page with the WordPress import option', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.wordPressImportButton ).toBeVisible();
			} );

			await test.step( 'When I choose the WordPress importer', async function () {
				await pageImportContent.wordPressImportButton.click();
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( pageImportLetsFindYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I enter my WordPress site URL and click Continue', async function () {
				await pageImportLetsFindYourSite.enterSiteURLAndCheck( wordpressSiteURL );
			} );

			await test.step( 'Then I see the What do you want to do? page', async function () {
				await expect( pageImportContentWordpressQuestion.heading ).toBeVisible();
			} );

			await test.step( 'When I choose "Import content only" option', async function () {
				await pageImportContentWordpressQuestion.clickImportContentOnlyButton();
			} );

			await test.step( 'Then I see the Import content from WordPress page', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid WordPress export file', async function () {
				await pageImportContentFromWordPress.importFileContentPage.uploadExportFile(
					TEST_WORDPRESS_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
				await expect(
					pageImportContentFromWordPress.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromWordPress.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromWordPress.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'As a New WordPress.com free plan user with a simple site, I can use the WordPress option and enter my WordPress site on the Calypso List page to import my content from my WordPress site', async ( {
			pageImportContentFromWordPress,
			pageImportLetsFindYourSite,
			pageImportContentWordpressQuestion,
			sitePublic,
		} ) => {
			const wordpressSiteURL = 'https://test.wordpress.com/';

			await test.step( 'When I visit the "Let\'s find your site" page as coming from the wp-admin Tools > Import page', async function () {
				await pageImportLetsFindYourSite.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( pageImportLetsFindYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I enter my WordPress site URL and click Continue', async function () {
				await pageImportLetsFindYourSite.enterSiteURLAndCheck( wordpressSiteURL );
			} );

			await test.step( 'Then I see the What do you want to do? page', async function () {
				await expect( pageImportContentWordpressQuestion.heading ).toBeVisible();
			} );

			await test.step( 'When I choose "Import content only" option', async function () {
				await pageImportContentWordpressQuestion.clickImportContentOnlyButton();
			} );

			await test.step( 'Then I see the Import content from WordPress page', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid WordPress export file', async function () {
				await pageImportContentFromWordPress.importFileContentPage.uploadExportFile(
					TEST_WORDPRESS_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromWordPress.heading ).toBeVisible();
				await expect(
					pageImportContentFromWordPress.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromWordPress.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromWordPress.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );
	}
);
