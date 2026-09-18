import path from 'path';
import { expect, skipIfMailosaurLimitReached, tags, test } from '../../lib/pw-base';

const TEST_WORDPRESS_EXPORT_FILE_PATH = path.join(
	__dirname,
	'import-files',
	'wordpress-export-example.xml'
);

test.describe(
	'Site Import: Calypso: WordPress',
	{
		tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ],
	},
	() => {
		skipIfMailosaurLimitReached();

		test( 'One: As a New WordPress.com free plan user with a simple site, I can use the "WordPress Run Importer" link on the wp-admin Importers List page to import my content from my WordPress site', async ( {
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

		test( 'Two: As a free plan user, I can reach the migration offer from the WordPress.com migration entry', async ( {
			page,
			pageImportLetsFindYourSite,
			pageImportLetUsMigrateYourSite,
			sitePublic,
		} ) => {
			const wordpressSiteURL = 'https://test.wordpress.com/';

			await test.step( 'When I open the migration-identify entry used by the WordPress.com importer link', async function () {
				await pageImportLetsFindYourSite.visit( sitePublic.blog_details.site_slug, {
					siteId: sitePublic.blog_details.blogid,
				} );
			} );

			await test.step( "Then I see the Let's find your site page", async function () {
				await expect( pageImportLetsFindYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I enter my WordPress site URL and click Continue', async function () {
				await pageImportLetsFindYourSite.enterSiteURLAndCheck( wordpressSiteURL );
			} );

			await test.step( 'Then I reach the migration offer directly with my source and destination', async function () {
				await expect( pageImportLetUsMigrateYourSite.heading ).toBeVisible();
				const url = new URL( page.url() );
				expect( url.pathname ).toContain( '/site-migration-how-to-migrate' );
				expect( url.searchParams.get( 'siteSlug' ) ).toBe( sitePublic.blog_details.site_slug );
				expect( url.searchParams.get( 'from' ) ).toBe( wordpressSiteURL );
			} );
		} );

		test( 'Three: As a free plan user, I can import a WordPress export file directly from the Calypso importer list', async ( {
			pageImportContent,
			sitePublicShared: sitePublic,
		} ) => {
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

			await test.step( 'Then I see the Import content from WordPress page', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.wordPressHeading ).toBeVisible();
			} );

			await test.step( 'When I upload a valid WordPress export file', async function () {
				await pageImportContent.importFileContentPage.uploadExportFile(
					TEST_WORDPRESS_EXPORT_FILE_PATH
				);
			} );

			await test.step( 'Then I see an Import confirmation page showing the authorship of the content to be imported', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.wordPressHeading ).toBeVisible();
				await expect( pageImportContent.importFileContentPage.yourFileIsReadyText ).toBeVisible( {
					timeout: 30000,
				} );
				await expect( pageImportContent.importFileContentPage.importButton ).toBeVisible();
				await expect( pageImportContent.importFileContentPage.importButton ).toBeEnabled();
			} );
		} );

		test.describe( 'Destination selection', () => {
			test.use( { sitePublicSiteCount: 2 } );

			test( 'Four: As a free plan user, I can select WordPress from the migration platform picker and reach the upgrade step', async ( {
				page,
				pageImportLetsFindYourSite,
				pageImportLetUsMigrateYourSite,
				pageImportContentFromAnotherPlatformOrFile,
				pageImportContentFromWordPress,
				pageImportPlans,
				sitePublic,
			} ) => {
				await test.step( 'When I open migration without a source or destination', async function () {
					await pageImportLetsFindYourSite.visit( undefined, {
						hideImporterLink: false,
					} );
				} );

				await test.step( 'When I use the "pick your current platform from a list" button', async function () {
					await pageImportLetsFindYourSite.clickPickFromListButton();
				} );

				await test.step( 'Then I select my destination site', async function () {
					await expect(
						page.getByRole( 'heading', { name: 'Pick your destination' } )
					).toBeVisible();
					await page
						.getByRole( 'searchbox', { name: 'Search', exact: true } )
						.fill( sitePublic.blog_details.site_slug );
					const destinationSite = page
						.getByRole( 'link', { name: sitePublic.blog_details.site_slug } )
						.locator( '..' )
						.locator( '..' );
					const selectSite = destinationSite.getByRole( 'button', {
						name: 'Select this site',
						exact: true,
					} );
					await expect( selectSite ).toHaveCount( 1 );
					await selectSite.click();
					await page
						.getByRole( 'dialog', { name: 'Confirm your choice' } )
						.getByRole( 'button', {
							name: 'Continue',
							exact: true,
						} )
						.click();
				} );

				await test.step( 'Then I see the "Import content from another platform or file" page', async function () {
					await expect( pageImportContentFromAnotherPlatformOrFile.heading ).toBeVisible();
				} );

				await test.step( 'When I choose the "WordPress" option', async function () {
					await pageImportContentFromAnotherPlatformOrFile.clickWordPressOption();
				} );

				await test.step( 'Then I see the "Let us migrate your site" page', async function () {
					await expect( pageImportLetUsMigrateYourSite.heading ).toBeVisible();
				} );

				await test.step( 'When I choose to import a WordPress export file', async function () {
					await pageImportLetUsMigrateYourSite.importExportFileButton.click();
				} );

				await test.step( 'Then I can upload a file to the selected destination without upgrading', async function () {
					await expect( pageImportContentFromWordPress.heading ).toBeVisible();
					const query = new URL( page.url() ).searchParams;
					expect( query.get( 'siteId' ) ).toBe( String( sitePublic.blog_details.blogid ) );
					expect( query.get( 'siteSlug' ) ).toBe( sitePublic.blog_details.site_slug );
					await pageImportContentFromWordPress.importFileContentPage.uploadExportFile(
						TEST_WORDPRESS_EXPORT_FILE_PATH
					);
					await expect(
						pageImportContentFromWordPress.importFileContentPage.yourFileIsReadyText
					).toBeVisible( { timeout: 30000 } );
				} );

				await test.step( 'When I go back, I return to the migration offer', async function () {
					await page.getByRole( 'button', { name: 'Back', exact: true } ).click();
					await expect( pageImportLetUsMigrateYourSite.heading ).toBeVisible();
					expect( new URL( page.url() ).searchParams.get( 'siteId' ) ).toBe(
						String( sitePublic.blog_details.blogid )
					);
				} );

				await test.step( 'When I click the "Get Started" button', async function () {
					await pageImportLetUsMigrateYourSite.clickGetStarted();
				} );

				await test.step( 'Then I see the WordPress.com Plans page', async function () {
					await expect( pageImportPlans.heading ).toBeVisible();
				} );
			} );
		} );
	}
);
