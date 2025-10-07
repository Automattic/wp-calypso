import path from 'path';
import { expect, tags, test } from '../../lib/pw-base';

const TEST_MEDIUM_EXPORT_FILE_PATH = path.join( __dirname, 'medium-export-example.zip' );

test.describe(
	'Site Import: Calypso: Medium',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS ],
		annotation: { type: 'flowchart', description: 'https://flowchart.fun/p/envious-tent-cost' },
	},
	() => {
		test( 'As a New WordPress.com free plan user with a simple site, I can use the wp-admin Importers List Medium link to import my content from my medium.com account', async ( {
			pageImportContentFromMedium,
			sitePublic,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The import tests only run in Chrome' );

			await test.step( 'When I visit the Medium importer as coming from the wp-admin Tools > Import page', async function () {
				await pageImportContentFromMedium.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect( pageImportContentFromMedium.heading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await pageImportContentFromMedium.uploadExportFile( TEST_MEDIUM_EXPORT_FILE_PATH );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContentFromMedium.heading ).toBeVisible();
				await expect( pageImportContentFromMedium.yourFileIsReadyText ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( pageImportContentFromMedium.importButton ).toBeVisible();
				await expect( pageImportContentFromMedium.importButton ).toBeEnabled();
			} );
		} );

		test( 'As a New WordPress.com free plan user with a simple site, I can use the wp-admin Importers List WordPress.com link to import my content from my medium.com account', async ( {
			helperData,
			page,
			sitePublic,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The import tests only run in Chrome' );

			const mediumSiteURL = 'https://medium.com/@testacount';

			await test.step( 'When I visit the "Let\'s find your site" page as coming from the wp-admin Tools > Import page', async function () {
				await page.goto(
					helperData.getCalypsoURL( 'setup/site-migration/site-migration-identify', {
						hide_importer_link: 'true',
						siteSlug: sitePublic.blog_details.site_slug,
						isUploadInProgress: 'false',
					} )
				);
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( page.getByRole( 'heading', { name: "Let's find your site" } ) ).toBeVisible();
			} );

			await test.step( 'When I enter my Medium site URL and click Continue', async function () {
				await page
					.getByRole( 'textbox', { name: 'Enter your site address:' } )
					.fill( mediumSiteURL );
				await page.getByRole( 'button', { name: 'Check my site' } ).click();
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await page.locator( 'input[type="file"]' ).setInputFiles( TEST_MEDIUM_EXPORT_FILE_PATH );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect(
					page.getByRole( 'heading', { name: 'Import content from Medium' } )
				).toBeVisible();
				await expect( page.getByText( 'Your file is ready to be imported' ) ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeEnabled();
			} );
		} );

		test( 'As a New WordPress.com free plan user with a simple site, I can use the Calypso "Import Content" page to import my content from my medium.com account', async ( {
			sitePublic,
			page,
			helperData,
		}, workerInfo ) => {
			test.skip( workerInfo.project.name !== 'chrome', 'The import tests only run in Chrome' );

			await test.step( 'When I visit the "Import Content" page for my new site', async function () {
				await page.goto(
					helperData.getCalypsoURL( `import/${ sitePublic.blog_details.site_slug }` )
				);
			} );

			await test.step( 'Then I see the "Import Content" Calypso page with the Medium import option', async function () {
				await expect( page.getByRole( 'heading', { name: 'Import Content' } ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Medium' } ) ).toBeVisible();
			} );

			await test.step( 'When I choose the Medium importer', async function () {
				await page.getByRole( 'button', { name: 'Medium' } ).click();
			} );

			await test.step( 'Then I see the Import content from Medium page', async function () {
				await expect( page.getByRole( 'heading', { name: 'Import Content' } ) ).toBeVisible();
				await expect( page.getByRole( 'heading', { name: 'Medium' } ) ).toBeVisible();
			} );

			await test.step( 'When I upload a valid Medium export file', async function () {
				await page
					.locator( 'input[type="file"][name="exportFile"]' )
					.setInputFiles( TEST_MEDIUM_EXPORT_FILE_PATH );
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( page.getByRole( 'heading', { name: 'Import content' } ) ).toBeVisible();
				await expect( page.getByText( 'Your file is ready to be imported' ) ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeVisible();
				await expect( page.getByRole( 'button', { name: 'Import' } ) ).toBeEnabled();
			} );
		} );
	}
);
