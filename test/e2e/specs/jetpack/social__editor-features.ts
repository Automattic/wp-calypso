/**
 * @group calypso-pr
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	EditorPage,
	SecretsManager,
	SocialConnectionsManager,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

const features4SimpleSites = {
	resharing: false,
	manualSharing: true,
	mediaSharing: false,
	socialImageGenerator: false,
};

const testCases: Array< {
	plan: string;
	platform: 'Simple' | 'Atomic';
	testAccountName: TestAccountName;
	features: Record<
		'resharing' | 'manualSharing' | 'mediaSharing' | 'socialImageGenerator',
		boolean
	>;
} > = [
	{
		plan: 'Free',
		platform: 'Simple',
		testAccountName: 'simpleSiteFreePlanUser',
		features: features4SimpleSites,
	},
	{
		plan: 'Personal',
		platform: 'Simple',
		testAccountName: 'simpleSitePersonalPlanUser',
		features: features4SimpleSites,
	},
	{
		plan: 'Paid',
		platform: 'Atomic',
		testAccountName: 'atomicUser',
		features: {
			resharing: true,
			manualSharing: true,
			mediaSharing: true,
			socialImageGenerator: false,
		},
	},
];

/**
 * Tests features offered by Jetpack Social on a Simple site with Free plan.
 *
 * Keywords: Social, Jetpack, Publicize
 */
describe( DataHelper.createSuiteTitle( 'Social: Editor features' ), function () {
	for ( const { plan, platform, testAccountName, features } of testCases ) {
		const title = `For ${ platform } sites with ${ plan } plan`;

		describe( DataHelper.createSuiteTitle( title ), function () {
			let page: Page;
			let editorPage: EditorPage;
			let socialConnectionsManager: SocialConnectionsManager;

			const credentials = SecretsManager.secrets.testAccounts[ testAccountName ];
			const siteSlug = credentials.testSites?.primary?.url;
			const siteId = credentials.testSites?.primary?.id;

			beforeAll( async () => {
				page = await browser.newPage();
				editorPage = new EditorPage( page );
				socialConnectionsManager = new SocialConnectionsManager( page, siteId! );

				const testAccount = new TestAccount( testAccountName );
				await testAccount.authenticate( page );
			} );

			beforeEach( async () => {
				await editorPage.visit( 'post', { siteSlug } );
			} );

			afterEach( async () => {
				await socialConnectionsManager.clearIntercepts();
			} );

			test( 'Should verify that auto-sharing is available for new posts', async function () {
				await socialConnectionsManager.interceptRequests();

				await Promise.all( [
					// Open the Jetpack sidebar.
					editorPage.openSettings( 'Jetpack' ),
					// Wait for the connection test results to finish
					socialConnectionsManager.waitForConnectionTests(),
				] );

				// Expand the Publicize panel.
				const section = await editorPage.expandSection( 'Share this post' );

				// Verify that the toggle is enabled.
				const toggle = section.getByLabel( 'Share when publishing' );
				expect( await toggle.isChecked() ).toBe( true );

				// Verify that the message box is editable.
				const messageBox = section.getByRole( 'textbox', { name: 'Message' } );
				expect( await messageBox.isEditable() ).toBe( true );

				// Verify whether the media button is available.
				const mediaButton = section.getByRole( 'button', { name: 'Choose Media' } );
				expect( await mediaButton.isVisible() ).toBe( features.mediaSharing );
			} );

			test( `Should verify that resharing ${
				features.resharing ? 'IS' : 'is NOT'
			} available`, async function () {
				let connectionTestPromise = Promise.resolve();
				if ( features.resharing ) {
					await socialConnectionsManager.interceptRequests();

					connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
				}

				// Open the Jetpack sidebar.
				await editorPage.openSettings( 'Jetpack' );

				await connectionTestPromise;

				// Expand the Publicize panel.
				let section = await editorPage.expandSection( 'Share this post' );

				// Verify that resharing button is not visible on new posts.
				let reshareButton = section.getByRole( 'button', { name: 'Share post', exact: true } );
				expect( await reshareButton.isVisible() ).toBe( false );

				// Set a title for the post
				await editorPage.enterTitle( 'Resharing: ' + DataHelper.getRandomPhrase() );
				// Publish the post.
				await editorPage.publish();
				await editorPage.closeAllPanels();

				if ( features.resharing ) {
					connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
				}

				// Open the Jetpack sidebar.
				await editorPage.openSettings( 'Jetpack' );

				await connectionTestPromise;

				// Expand the Publicize panel.
				section = await editorPage.expandSection( 'Share this post' );

				// Verify whether the auto-share toggle is no longer visible.
				const toggle = section.getByLabel( 'Share when publishing' );
				expect( await toggle.isVisible() ).toBe( false );

				// Verify whether the resharing button is visible.
				reshareButton = section.getByRole( 'button', { name: 'Share post', exact: true } );
				expect( await reshareButton.isVisible() ).toBe( features.resharing );

				// Verify whether the upgrade nudge/link is visible.
				if ( ! features.resharing ) {
					const upgradeLink = section.getByRole( 'link', { name: 'Upgrade now' } );
					// The upgrade CTA is a button instead of a link until some API call finishes to get the checkout URL, which makes it a link.
					// So, we need to wait for the link to appear.
					await upgradeLink.waitFor();
				}

				const content = await section.textContent();

				const message = 'To re-share a post, you need to upgrade to the WordPress.com Premium plan';

				expect( content?.includes( message ) ).toBe( ! features.resharing );
			} );

			test( `Should verify that manual sharing ${
				features.manualSharing ? 'IS' : 'is NOT'
			} available`, async function () {
				// Open the Jetpack sidebar.
				await editorPage.openSettings( 'Jetpack' );

				// Expand the Publicize panel.
				let section = await editorPage.expandSection( 'Share this post' );

				// Verify that manual sharing is NOT available before publishing.
				let manualSharing = section.getByRole( 'paragraph', { name: 'Manual sharing' } );
				expect( await manualSharing.isVisible() ).toBe( false );

				// Set a title for the post
				await editorPage.enterTitle( 'Manual sharing: ' + DataHelper.getRandomPhrase() );
				// Publish the post.
				await editorPage.publish();

				// Verify whether the manual sharing is available on post publish panel
				manualSharing = ( await editorPage.getPublishPanelRoot() ).getByRole( 'button', {
					name: 'Manual sharing',
				} );

				// For some reason the manual sharing is not visible on the post publish panel for Simple sites with personal plan.
				const isPostPublishManualSharingVisible =
					features.manualSharing && ! ( platform === 'Simple' && plan === 'Personal' );

				if ( isPostPublishManualSharingVisible ) {
					await manualSharing.waitFor();
				}

				// Close the post publish panel.
				await editorPage.closeAllPanels();

				// Open the Jetpack sidebar.
				await editorPage.openSettings( 'Jetpack' );

				// Expand the Publicize panel.
				section = await editorPage.expandSection( 'Share this post' );

				// Verify whether manual sharing is available in the Jetpack sidebar.
				manualSharing = section.getByText( 'Manual sharing' );
				expect( await manualSharing.isVisible() ).toBe( features.manualSharing );
			} );

			test( `Should verify that Social Image Generator ${
				features.socialImageGenerator ? 'IS' : 'is NOT'
			} available`, async function () {
				// Open the Jetpack sidebar.
				await editorPage.openSettings( 'Jetpack' );

				const section = await editorPage.getSettingsSection( 'Social Image Generator' );

				// Verify whether the Social Image Generator panel exists.
				expect( await section.isVisible() ).toBe( features.socialImageGenerator );
			} );
		} );
	}
} );
