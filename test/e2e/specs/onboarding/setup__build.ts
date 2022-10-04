/**
 * @group calypso-pr
 */

import { DataHelper, SecretsManager, StartSiteFlow, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Site Build with "Travel Agencies & Services" category' ),
	() => {
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;
		const siteSlug = credentials.testSites?.primary?.url as string;

		let page: Page;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( 'defaultUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Onboarding', function () {
			let startSiteFlow: StartSiteFlow;

			beforeAll( async function () {
				startSiteFlow = new StartSiteFlow( page );
			} );

			it( 'Enter Onboarding flow', async function () {
				await page.goto( DataHelper.getCalypsoURL( '/setup', { siteSlug } ) );
			} );

			it( 'Select "Promote" goal', async function () {
				await startSiteFlow.selectGoal( 'Promote' );
				await startSiteFlow.clickButton( 'Continue' );
			} );

			it( 'Select "Travel Agencies & Services" category', async function () {
				await startSiteFlow.enterVertical( 'Travel Agencies & Services' );
				await startSiteFlow.clickButton( 'Continue' );
			} );
		} );

		describe( 'Build', function () {
			const themeName = 'Stewart';

			let startSiteFlow: StartSiteFlow;

			beforeAll( async function () {
				startSiteFlow = new StartSiteFlow( page );
			} );

			it( 'Select theme', async function () {
				await startSiteFlow.selectTheme( themeName );
				await startSiteFlow.clickButton( `Start with ${ themeName }` );
			} );

			it( 'Land in Home dashboard', async function () {
				await page.waitForURL( DataHelper.getCalypsoURL( `/home/${ siteSlug }` ) );
			} );
		} );
	}
);
