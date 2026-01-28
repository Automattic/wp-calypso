import path from 'path';
import { envVariables } from '@automattic/calypso-e2e';
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
		annotation: {
			type: 'flowchart',
			description:
				'https://www.mermaidchart.com/play?utm_source=mermaid_live_editor&utm_medium=toggle#pako:eNqFU21r2zAQ_itHRrcWnFE57_mwQZJmFFpWtpQNln1QbaU2tSUjyZgw9nU_YD9xv2QnS4nlJG0N4izdc3ePnjv96kQiZp1pZ5OJKkqo1LCarTngd3YG3W4XbmnKoaA6UWZrXZz8WHeu80Ig_LwqujTOEWQPmFRwkyp9se78dOgQ0d-EjO8kUwr-_fkLX8oGvselUd6kjQTXjGvYSJHDPrjJ2UfofZEJGsP32xvYpBlrnAN0zgXfpDIHWupESC9yuC-yP3Oekc_zfYSFn-XKx4i9YfqdwtI8hq0oJahUeyQmiLjCS8iGfhtRxdtKx6ZmQjXEwiSBiuKltcDtxyYVIcfCCJ5tPUQPEbfpo6SaHfAgfUsVSgW5Q5ygS4xonxCmNE4Bi2vPzmc0u-dPXFQcsLjcQiFSrr3oUcNwbhl6TiPW9f5q6XGHp6daTCavahxeviYyD8303aXRk42PSilN1SKjeiNk7gF7z0wf5UInWGEXAkIezFvY9yfHU869oSU-rtbzwX9YMaXhM2f4_wFT1AafgN32rRlYMzyKW1XCukbWjK2Z1MYOlj9kuzhVB76FVSKZK0zIrvKpAFga0Syw56zjRgbefLgjx4Y4OmSyb2XDvCkdXh7R9ZFN6TB01lEI-63AltZf9TZjCs4fpSgLFgN2DKKMylRvL5oW4IlSC7aBKsFpMe3Mpm-W9RdEIhNy-pDR6OkA_JCVO-xstrhazl7APuI1uQPPx1fD-eQFsDREHYf5YhG2oR7YzECduXUWBrwf8GHARwGfBNhSXD1cA1zjAHXGhRiUrb6uH4t9DzjixoFVEyMwFcFEBDOh4ObObQJDQ3fNO7__AzQO7R4',
		},
	},
	() => {
		test.skip(
			envVariables.MAILOSAUR_LIMIT_REACHED,
			'Skipping: Mailosaur daily email limit reached (sitePublic fixture requires email verification)'
		);

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

		test( 'Two: As a New WordPress.com free plan user with a simple site, I can use the "WordPress.com Run Importer" link on the wp-admin Importers List page to import my content from my WordPress site', async ( {
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

		test( 'Three: As a New WordPress.com free plan user with a simple site, I can use the WordPress option and enter my WordPress site on the Calypso List page to import my content from my WordPress site', async ( {
			pageImportContent,
			pageImportLetsFindYourSite,
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

		test( 'Four: As a New WordPress.com free plan user with a simple site, I can use the WordPress option and pick my platform on the Calypso List page to import my content from my WordPress site', async ( {
			pageImportContent,
			pageImportLetsFindYourSite,
			pageImportLetUsMigrateYourSite,
			pageImportContentWordpressQuestion,
			pageImportContentFromAnotherPlatformOrFile,
			pageImportPlans,
			sitePublic,
		} ) => {
			await test.step( 'When I visit the "Import Content" page for my new site', async function () {
				await pageImportContent.visit( sitePublic.blog_details.site_slug );
			} );

			await test.step( 'Then I see the "Import Content" Calypso page with the choose import option', async function () {
				await expect( pageImportContent.heading ).toBeVisible();
				await expect( pageImportContent.wordPressImportButton ).toBeVisible();
			} );

			await test.step( 'When I choose the WordPress importer', async function () {
				await pageImportContent.wordPressImportButton.click();
			} );

			await test.step( 'When I use the "pick your current platform from a list" button', async function () {
				await pageImportLetsFindYourSite.clickPickFromListButton();
			} );

			await test.step( 'Then I see the "Import content from another platform or file" page', async function () {
				await expect( pageImportContentFromAnotherPlatformOrFile.heading ).toBeVisible();
			} );

			await test.step( 'When I choose the "WordPress" option', async function () {
				await pageImportContentFromAnotherPlatformOrFile.clickWordPressOption();
			} );

			await test.step( 'Then I see the What do you want to do? page', async function () {
				await expect( pageImportContentWordpressQuestion.heading ).toBeVisible();
			} );

			await test.step( 'When I choose the "Migrate site" option', async function () {
				await pageImportContentWordpressQuestion.clickMigrateSiteButton();
			} );

			await test.step( 'Then I see the "Let us migrate your site" page', async function () {
				await expect( pageImportLetUsMigrateYourSite.heading ).toBeVisible();
			} );

			await test.step( 'When I click the "Get Started" button', async function () {
				await pageImportLetUsMigrateYourSite.clickGetStarted();
			} );

			await test.step( 'Then I see the WordPress.com Plans page', async function () {
				await expect( pageImportPlans.heading ).toBeVisible();
			} );
		} );
	}
);
