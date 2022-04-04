/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	EditorPage,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Navbar` ), function () {
	const features = envToFeatureKey( envVariables );
	// @todo Does it make sense to create a `simpleSitePersonalPlanUserEdge` with GB edge?
	// for now, it will pick up the default `gutenbergAtomicSiteEdgeUser` if edge is set.
	const accountName = getTestAccountByFeature( features, [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	let page: Page;
	let editorPage: EditorPage;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page, { target: features.siteType } );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await editorPage.visit( 'post' );
	} );

	it( 'Return to Calypso dashboard', async function () {
		await editorPage.exitEditor();
	} );
} );
