import {
	EditorPage,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Editor: Navbar', { tag: [ tags.GUTENBERG, tags.CALYPSO_PR ] }, () => {
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

	test( 'As a user, I can open the editor and return to the Calypso dashboard', async ( {
		page,
	} ) => {
		let editorPage: EditorPage;
		let siteSlug: string;

		await test.step( 'Authenticate and setup the test', async () => {
			editorPage = new EditorPage( page );

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
			siteSlug = testAccount.getSiteURL( { protocol: false } );
		} );

		await test.step( 'Go to the new post page', async () => {
			await editorPage.visit( 'post', { siteSlug } );
		} );

		await test.step( 'Return to Calypso dashboard', async () => {
			const WPAdminBarLocator = page.locator( '#wpadminbar' );
			const isMobileClassicView =
				envVariables.VIEWPORT_NAME === 'mobile' && ( await WPAdminBarLocator.isVisible() );

			// The classic WP Admin Bar on mobile viewport doesn't have the
			// "return" button, so let's not fail this test if it's the case.
			// See https://github.com/Automattic/wp-calypso/pull/70982
			if ( ! isMobileClassicView ) {
				await editorPage.exitEditor();
			}
		} );
	} );
} );
