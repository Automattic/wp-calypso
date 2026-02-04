import { tags, test } from '../../lib/pw-base';

test.describe(
	'Importer: Site Setup',
	{
		tag: [ tags.CALYPSO_PR, tags.CALYPSO_RELEASE ],
	},
	() => {
		let siteSlug: string;

		test.beforeEach( 'Authenticate and get site slug', async ( { page, accountDefaultUser } ) => {
			await accountDefaultUser.authenticate( page );
			siteSlug = accountDefaultUser.credentials.testSites?.primary?.url as string;
		} );

		test.describe( 'Follow the WordPress import flow', () => {
			test( 'Start a content-only WordPress import and navigate back', async ( {
				flowStartImport,
			} ) => {
				await test.step( 'When I navigate to the Setup page', async () => {
					await flowStartImport.startSetup( siteSlug );
					await flowStartImport.validateURLCapturePage();
				} );

				await test.step( 'And I start a content-only WordPress import', async () => {
					await flowStartImport.enterURL( 'make.wordpress.org' );
					await flowStartImport.validateImporterDragPage( 'wordpress' );
				} );

				await test.step( 'Then clicking back shows the URL capture form', async () => {
					await flowStartImport.clickBack();
					await flowStartImport.validateURLMigrationFlow();
				} );
			} );
		} );

		test.describe( "Follow the WordPress can't be imported flow", () => {
			const testCases = [
				{
					url: 'wordpress.com',
					reason: 'Your site is already on WordPress.com',
				},
				{
					url: 'gravatar.com',
					reason: "Your existing content can't be imported",
				},
			];

			for ( const { url, reason } of testCases ) {
				test( `Start an invalid WordPress import on ${ url } (${ reason })`, async ( {
					flowStartImport,
				} ) => {
					await test.step( 'When I navigate to the Setup page', async () => {
						await flowStartImport.startSetup( siteSlug );
						await flowStartImport.validateURLCapturePage();
					} );

					await test.step( `And I start an invalid WordPress import on ${ url }`, async () => {
						await flowStartImport.enterURL( url );
						await flowStartImport.validateBuildingPage( reason );
						await flowStartImport.startBuilding();
						await flowStartImport.validateSetupPage();
					} );
				} );
			}
		} );

		test.describe( 'Follow the WordPress domain error flow', () => {
			test( 'Start an invalid WordPress import with domain typo', async ( { flowStartImport } ) => {
				await test.step( 'When I navigate to the Setup page', async () => {
					await flowStartImport.startSetup( siteSlug );
					await flowStartImport.validateURLCapturePage();
				} );

				await test.step( 'And I enter an invalid domain with typo', async () => {
					// zz.gravatar.com is guaranteed never to be a valid DNS
					await flowStartImport.enterURL( 'zz.gravatar.com' );

					// Support both Legacy and Goals Capture versions of the error message.
					await Promise.race( [
						flowStartImport.validateErrorCapturePage(
							'The address you entered is not valid. Please try again.'
						),
						flowStartImport.validateErrorCapturePage(
							'Please enter a valid website address. You can copy and paste.'
						),
					] );
				} );
			} );
		} );

		test.describe( 'Follow the import file flow', () => {
			test( 'Start a valid import file from Squarespace', async ( { flowStartImport } ) => {
				await test.step( 'When I navigate to the Setup page', async () => {
					await flowStartImport.startSetup( siteSlug );
					await flowStartImport.validateURLCapturePage();
				} );

				await test.step( 'And I start a valid import file', async () => {
					await flowStartImport.enterURL( 'https://squarespace.com' );
					await flowStartImport.validateImportPage();
					await flowStartImport.clickButton( 'Import your content' );
					await flowStartImport.validateImporterDragPage( 'squarespace' );
				} );
			} );
		} );

		test.describe( "I don't have a site flow", () => {
			test( 'Select that there is no site', async ( { flowStartImport } ) => {
				await test.step( 'When I navigate to the Setup page', async () => {
					await flowStartImport.startSetup( siteSlug );
					await flowStartImport.validateURLCapturePage();
				} );

				await test.step( 'And I select that there is no site', async () => {
					await flowStartImport.startImporterList();
					await flowStartImport.validateImporterListPage();
					await flowStartImport.selectImporterFromList( 0 );
				} );
			} );
		} );

		test.describe( 'Go back from error', () => {
			test( 'Back to URL capture page from error page', async ( { flowStartImport } ) => {
				await test.step( 'When I navigate to the Setup page', async () => {
					await flowStartImport.startSetup( siteSlug );
					await flowStartImport.validateURLCapturePage();
				} );

				await test.step( 'And I navigate to an error page', async () => {
					await flowStartImport.enterURL( 'gravatar.com' );
				} );

				await test.step( 'Then I can go back to URL capture page', async () => {
					await flowStartImport.clickButton( 'Back to start' );
					await flowStartImport.validateURLCapturePage();
				} );
			} );
		} );
	}
);
