import path from 'path';
import { expect, tags, test } from '../../lib/pw-base';

const TEST_MEDIUM_EXPORT_FILE_PATH = path.join(
	__dirname,
	'import-files',
	'medium-export-example.zip'
);

test.describe(
	'Site Import: Calypso: Medium',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ],
		annotation: { type: 'flowchart', description: 'https://flowchart.fun/p/envious-tent-cost' },
	},
	() => {
		test( 'One: As a New WordPress.com free plan user with a simple site, I can use the "Medium Run Importer" link on the wp-admin Importers List page to import my content from my Medium account', async ( {
			pageImportContentFromMedium,
			sitePublic,
		} ) => {
			await test.step( 'When I visit the Medium importer as coming from the wp-admin Tools > Import page', async function () {
				await pageImportContentFromMedium.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect( pageImportContentFromMedium.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await pageImportContentFromMedium.importFileContentPage.uploadExportFile(
					TEST_MEDIUM_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromMedium.heading ).toBeVisible();
				await expect(
					pageImportContentFromMedium.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromMedium.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromMedium.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'Two: As a New WordPress.com free plan user with a simple site, I can use the "WordPress.com import link" on the wp-admin Importers List page to import my content from my Medium account', async ( {
			pageImportContentFromMedium,
			pageImportLetsFindYourSite,
			sitePublic,
		} ) => {
			const mediumSiteURL = 'https://medium.com/@testacount';

			await test.step( 'When I visit the "Let\'s find your site" page as coming from the wp-admin Tools > Import page', async function () {
				await pageImportLetsFindYourSite.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( pageImportLetsFindYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I enter my Medium site URL and click Continue', async function () {
				await pageImportLetsFindYourSite.enterSiteURLAndCheck( mediumSiteURL );
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect( pageImportContentFromMedium.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await pageImportContentFromMedium.importFileContentPage.uploadExportFile(
					TEST_MEDIUM_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromMedium.heading ).toBeVisible();
				await expect(
					pageImportContentFromMedium.importFileContentPage.yourFileIsReadyText
				).toBeVisible( {
					timeout: 30000,
				} );
				await expect(
					pageImportContentFromMedium.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromMedium.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'Three: As a New WordPress.com free plan user with a simple site, I can use the Calypso "Import Content" page to import my content from my Medium account', async ( {
			sitePublic,
			pageImportContent,
		} ) => {
			await test.step( 'When I visit the "Import Content" page for my new site', async function () {
				await pageImportContent.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the "Import Content" Calypso page with the Medium import option', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.mediumImportButton ).toBeVisible();
			} );

			await test.step( 'When I choose the Medium importer', async function () {
				await pageImportContent.mediumImportButton.click();
			} );

			await test.step( 'Then I see the "Import Content" page with Medium options', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.mediumHeading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await pageImportContent.importFileContentPage.uploadExportFile(
					TEST_MEDIUM_EXPORT_FILE_PATH
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
