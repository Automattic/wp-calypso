/**
 * @group quarantined
 */

import { DataHelper, SecretsManager, StartSiteFlow, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Site Build' ), () => {
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
			await page.goto( DataHelper.getCalypsoURL( '/setup/site-setup', { siteSlug } ), {
				timeout: 30 * 1000,
			} );
		} );

		it( 'Select "Promote" goal', async function () {
			await startSiteFlow.selectGoal( 'Promote' );
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

		it( 'Land in Launchpad', async function () {
			await page.waitForURL(
				DataHelper.getCalypsoURL( `/setup/build/launchpad/?siteSlug=${ siteSlug }` ),
				{
					// This process takes a long time, uncertain why.
					timeout: 30 * 1000,
				}
			);
		} );
	} );
} );
