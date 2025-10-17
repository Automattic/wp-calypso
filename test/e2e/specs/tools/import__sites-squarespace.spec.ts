import path from 'path';
import { expect, tags, test } from '../../lib/pw-base';

const TEST_SQUARESPACE_EXPORT_FILE_PATH = path.join(
	__dirname,
	'import-files',
	'squarespace-export-example.xml'
);

test.describe(
	'Site Import: Calypso: Squarespace',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ],
		annotation: { type: 'flowchart', description: 'https://flowchart.fun/p/dynamic-camp-misspell' },
	},
	() => {
		test( 'One: As a New WordPress.com free plan user with a simple site, I can use the "Squarespace Run Importer" link on the wp-admin Importers List page to import my content from my Squarespace account', async ( {
			pageImportContentFromSquarespace,
			sitePublic,
		} ) => {
			await test.step( 'When I visit the Squarespace importer as coming from the wp-admin Tools > Import page', async function () {
				await pageImportContentFromSquarespace.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the Import content from Squarespace page', async function () {
				await expect( pageImportContentFromSquarespace.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Squarespace export file', async function () {
				await pageImportContentFromSquarespace.importFileContentPage.uploadExportFile(
					TEST_SQUARESPACE_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromSquarespace.heading ).toBeVisible();
				await expect(
					pageImportContentFromSquarespace.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromSquarespace.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromSquarespace.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'Two: As a New WordPress.com free plan user with a simple site, I can use the "WordPress.com import link" on the wp-admin Importers List page to import my content from my Squarespace account', async ( {
			pageImportContentFromSquarespace,
			pageImportLetsFindYourSite,
			sitePublic,
		} ) => {
			const squarespaceSiteURL = 'https://example.squarespace.com/';

			await test.step( 'When I visit the "Let\'s find your site" page as coming from the wp-admin Tools > Import page', async function () {
				await pageImportLetsFindYourSite.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( pageImportLetsFindYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I enter my Squarespace site URL and click Continue', async function () {
				await pageImportLetsFindYourSite.enterSiteURLAndCheck( squarespaceSiteURL );
			} );

			await test.step( 'Then I see the Import content from Squarespace page', async function () {
				await expect( pageImportContentFromSquarespace.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Squarespace export file', async function () {
				await pageImportContentFromSquarespace.importFileContentPage.uploadExportFile(
					TEST_SQUARESPACE_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromSquarespace.heading ).toBeVisible();
				await expect(
					pageImportContentFromSquarespace.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromSquarespace.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromSquarespace.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'Three: As a New WordPress.com free plan user with a simple site, I can use the Calypso "Import Content" page to import my content from my Squarespace account', async ( {
			sitePublic,
			pageImportContent,
		} ) => {
			await test.step( 'When I visit the "Import Content" page for my new site', async function () {
				await pageImportContent.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the "Import Content" Calypso page with the Squarespace import option', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.squarespaceImportButton ).toBeVisible();
			} );

			await test.step( 'When I choose the Squarespace importer', async function () {
				await pageImportContent.squarespaceImportButton.click();
			} );

			await test.step( 'Then I see the "Import Content" page with Squarespace options', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.squarespaceHeading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Squarespace export file', async function () {
				await pageImportContent.importFileContentPage.uploadExportFile(
					TEST_SQUARESPACE_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.importFileContentPage.yourFileIsReadyText ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( pageImportContent.importFileContentPage.importButton ).toBeVisible();
				await expect( pageImportContent.importFileContentPage.importButton ).toBeEnabled();
			} );
		} );
	}
);
