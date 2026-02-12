import path from 'path';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';

const TEST_SQUARESPACE_EXPORT_FILE_PATH = path.join(
	__dirname,
	'import-files',
	'squarespace-export-example.xml'
);

test.describe(
	'Site Import: Calypso: Squarespace',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ],
		annotation: {
			type: 'flowchart',
			description:
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqNU92Ok0AUfpUTTLSbWJNhKaVcGFPaTUw2arTGC_FiFoZAnM7gzBBSN3u7D-Aj-iSedljArawDN2T4fjjf-bj1MpkzL_YKLtuspMrAbp0KwKut6dfUe7uvJR7O2npO830lwB4wpeG60uYi9b7BfA47pg28FwyfX4PwkfjpR0MV0zXNGPy-_wUfm4GLJOsh_BOhyvaDVSaFYcJAoeQeRio9CdHWJkDS55pLmsPPqoai4gNIBBaz-L8wzBIpikrtgTamlEpfDCoLqxL2Kv0rjKcffNdKi1si7otU-QeU1q8y9JkefWkp0Ztb4PSG8RhS75qZFxoHETkcZKNAVwZHgruOElnKCl22OIv6a4ojFmieH60HF0IQ_E4a0I1iIAvABNQBallhEiVTzC4QVYk_RJXYqEYyfge6PIKgpcg2EqrzZONHO4PnyIqQlZRSambTLxrOgWN_Rg6XQ5ylYl2TSHD2UTB7tPPRuki3dbJ4qhqk2yoJ_yE-3QUSdrTleRvE6qHID2C7K2xJKuyRNgfOTrXBr-HxsyTahsnqZSa5VPENp9n3MQ7_DAu7Ol1TsOO_YHHr9WZ7tZ6UC5zksO9OaqGb2tINFrmZrtzUCOlxyWbjT-N8N1sspptv5IgLHH0Xjnqho95T2zje3t0fS9Luog',
		},
	},
	() => {
		skipIfMailosaurLimitReached();

		test( 'One: As a New WordPress.com free plan user with a simple site, I can use the "Squarespace Run Importer" link on the wp-admin Importers List page to import my content from my Squarespace site', async ( {
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

		test( 'Two: As a New WordPress.com free plan user with a simple site, I can use the "WordPress.com import link" on the wp-admin Importers List page to import my content from my Squarespace site', async ( {
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

		test( 'Three: As a New WordPress.com free plan user with a simple site, I can use the Calypso "Import Content" page to import my content from my Squarespace site', async ( {
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
