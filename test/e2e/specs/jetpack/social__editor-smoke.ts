/**
 * @group jetpack-wpcom-integration
 */

import { DataHelper, EditorPage, SecretsManager, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

/**
 * Tests features offered by Jetpack Social.
 *
 * Keywords: Social, Jetpack, Publicize
 */
describe( DataHelper.createSuiteTitle( 'Social: Editor Smoke test' ), function () {
	let page: Page;
	let editorPage: EditorPage;

	const siteSlug =
		SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser.testSites?.primary.url;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
	} );

	it( 'Verify that Social UI is visible', async function () {
		await editorPage.visit( 'post', { siteSlug } );

		// Open the Jetpack sidebar.
		await editorPage.openSettings( 'Jetpack' );

		// Expand the Publicize panel.
		await editorPage.expandSection( 'Share this post' );

		const editorParent = await editorPage.getEditorParent();

		const toggle = editorParent.getByLabel( 'Share when publishing' );

		expect( await toggle.isChecked() ).toBe( false );

		const link = editorParent.getByRole( 'link', { name: 'Connect an account' } );

		expect( await link.isVisible() ).toBe( true );
	} );
} );
