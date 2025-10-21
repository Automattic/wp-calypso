import path from 'path';
import { expect, tags, test } from '../../lib/pw-base';

const TEST_SUBSTACK_EXPORT_FILE_PATH = path.join( __dirname, 'import-files', 'substackexport.zip' );

test.describe(
	'Site Import: Calypso: Substack',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ],
		annotation: {
			type: 'flowchart',
			description:
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqNks1q20AQgF9lUCG0UJfIsR3bgUItOxAwTcgPPdQ5KKt1tVTaUXZXFUrINQ-QR8yTZOSVJTXGYaWLWH3zzezMPHoMI-5NvXWCBYtDZeB6tpJAj_R_r7yzNEM6-1xkvTBKhQR7wJWGpdDmy8q7hV4PrrmmwALp-zvIPgVe5XfahOwvvD6_wGXeBlJE7e9vaFHKNk-JuQLJC51w02UJ2sBa5wQvJP2zbJPm5nLZ0ERZNdOtmiFFSQNrhWkT1iZg2tY-ooibLMEwggeRwVokvK14ZJnjXWshTAwH9zmakwDlP-qPQAk6T9NQlfa81RxbzZg0BBsh806Osf05-TDHj9zEqCANs0zIP-_9fjOSc8mtzj8k3y9U0YXiWn9j1IP9g_EP66BqA5bcHIQZ6hNNzZCRbbsWplOyf0TcTzR0X8UB10DVqhIyFFR1zBX_b0tixbdFDdpLBvaSHemghoYVBEVILoMgdqc53R0nlb7dl-3BcLttK1lviSkTXjWLZpxMPwXjxSiYfGWYoJreJZWti_Vr7HTz7MOqPbXcbDZfnM72cdWGOvmYdvLRZrroaPOcbGM328TNRuvkpPN9R99R4wvm8_5-buDoG35QX_V6T2_qKqlu',
		},
	},
	() => {
		const substackSiteURL = 'https://test.substack.com/';
		const substackSiteName = 'Testing Product';

		test( 'One: As a New WordPress.com free plan user with a simple site, I can use the "WordPress.com Run Importer" link on the wp-admin Importers List page to import my content from my Substack account', async ( {
			pageImportContentFromSubstack,
			pageImportLetsFindYourSite,
			sitePublic,
		} ) => {
			await test.step( 'When I visit the "Let\'s find your site" page as coming from the wp-admin Tools > Import page', async function () {
				await pageImportLetsFindYourSite.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( pageImportLetsFindYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I enter my Substack site URL and click Continue', async function () {
				await pageImportLetsFindYourSite.enterSiteURLAndCheck( substackSiteURL );
			} );

			await test.step( 'Then I see the Import content from Substack page with my site name', async function () {
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
			} );

			await test.step( 'When I upload a valid Substack export file', async function () {
				await pageImportContentFromSubstack.importFileContentPage.uploadExportFile(
					TEST_SUBSTACK_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see a "Processing uploaded file" message temporarily', async function () {
				await expect( pageImportContentFromSubstack.processingUploadedFileButton ).toBeVisible();
				await pageImportContentFromSubstack.processingUploadedFileButton.waitFor( {
					state: 'detached',
				} );
			} );

			await test.step( 'Then I see a "Import content from Substack" page with a conversion summary', async function () {
				await expect( pageImportContentFromSubstack.importContentHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
				await expect( pageImportContentFromSubstack.conversionSummaryHeading ).toBeVisible();
			} );

			await test.step( 'When I click continue', async function () {
				await pageImportContentFromSubstack.clickContinue();
			} );

			await test.step( 'Then I see a "Import content from Substack" page with Author mapping', async function () {
				await expect( pageImportContentFromSubstack.importContentHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
				await expect( pageImportContentFromSubstack.authorMappingHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'Two: As a New WordPress.com free plan user with a simple site, I can use the "Substack Run Importer" link on the wp-admin Importers List page to import my content from my Substack account', async ( {
			pageImportContentFromSubstack,
			sitePublic,
		} ) => {
			await test.step( 'When I visit the Substack importer as coming from the wp-admin Tools > Import page', async function () {
				await pageImportContentFromSubstack.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the "Import your newsletter" page', async function () {
				await expect( pageImportContentFromSubstack.newsLetterHeading ).toBeVisible();
			} );

			await test.step( 'When I enter my Substack site URL and continue', async function () {
				await pageImportContentFromSubstack.enterSubstackSiteAddressAndContinue( substackSiteURL );
			} );

			await test.step( 'Then I see the Import content from Substack page with my site name', async function () {
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
			} );

			await test.step( 'When I upload a valid Substack export file', async function () {
				await pageImportContentFromSubstack.importFileContentPage.uploadExportFile(
					TEST_SUBSTACK_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see a "Processing uploaded file" message temporarily', async function () {
				await expect( pageImportContentFromSubstack.processingUploadedFileButton ).toBeVisible();
				await pageImportContentFromSubstack.processingUploadedFileButton.waitFor( {
					state: 'detached',
				} );
			} );

			await test.step( 'Then I see a "Import content from Substack" page with a conversion summary', async function () {
				await expect( pageImportContentFromSubstack.importContentHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
				await expect( pageImportContentFromSubstack.conversionSummaryHeading ).toBeVisible();
			} );

			await test.step( 'When I click continue', async function () {
				await pageImportContentFromSubstack.clickContinue();
			} );

			await test.step( 'Then I see a "Import content from Substack" page with Author mapping', async function () {
				await expect( pageImportContentFromSubstack.importContentHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
				await expect( pageImportContentFromSubstack.authorMappingHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );

		test( 'Three: As a New WordPress.com free plan user with a simple site, I can use the Calypso "Import Content" page to import my content from my Substack account', async ( {
			sitePublic,
			pageImportContent,
			pageImportContentFromSubstack,
		} ) => {
			await test.step( 'When I visit the "Import Content" page for my new site', async function () {
				await pageImportContent.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the "Import Content" Calypso page with the Substack import option', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.substackImportButton ).toBeVisible();
			} );

			await test.step( 'When I choose the Substack importer', async function () {
				await pageImportContent.substackImportButton.click();
			} );

			await test.step( 'Then I see the "Import your newsletter" page', async function () {
				await expect( pageImportContentFromSubstack.newsLetterHeading ).toBeVisible();
			} );

			await test.step( 'When I enter my Substack site URL and continue', async function () {
				await pageImportContentFromSubstack.enterSubstackSiteAddressAndContinue( substackSiteURL );
			} );

			await test.step( 'Then I see the Import content from Substack page with my site name', async function () {
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
			} );

			await test.step( 'When I upload a valid Substack export file', async function () {
				await pageImportContentFromSubstack.importFileContentPage.uploadExportFile(
					TEST_SUBSTACK_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see a "Processing uploaded file" message temporarily', async function () {
				await expect( pageImportContentFromSubstack.processingUploadedFileButton ).toBeVisible();
				await pageImportContentFromSubstack.processingUploadedFileButton.waitFor( {
					state: 'detached',
				} );
			} );

			await test.step( 'Then I see a page with a conversion summary', async function () {
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
				await expect( pageImportContentFromSubstack.conversionSummaryHeading ).toBeVisible();
			} );

			await test.step( 'When I click continue', async function () {
				await pageImportContentFromSubstack.clickContinue();
			} );

			await test.step( 'Then I see a page with Author mapping', async function () {
				await expect(
					pageImportContentFromSubstack.importHeading( substackSiteName )
				).toBeVisible();
				await expect( pageImportContentFromSubstack.authorMappingHeading ).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importFileContentPage.importButton
				).toBeVisible();
				await expect(
					pageImportContentFromSubstack.importFileContentPage.importButton
				).toBeEnabled();
			} );
		} );
	}
);
