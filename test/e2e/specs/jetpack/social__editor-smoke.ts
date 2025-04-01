/**
 * @group calypso-pr
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	EditorPage,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	TestAccount,
} from '@automattic/calypso-e2e';
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

	let siteSlug: string;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
		const testAccount = new TestAccount( accountName );
		siteSlug = testAccount.getSiteURL( { protocol: false } );
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

		await toggle.waitFor();
	} );
} );
