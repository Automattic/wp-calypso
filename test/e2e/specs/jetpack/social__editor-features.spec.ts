import {
	DataHelper,
	EditorPage,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
	SocialConnectionsManager,
	TestAccount,
	TestAccountName,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { expect, tags, test } from '../../lib/pw-base';

const features4SimpleSites = {
	resharing: false,
	manualSharing: true,
	mediaSharing: false,
	socialImageGenerator: false,
};

const features4BusinessPlan = {
	resharing: true,
	manualSharing: true,
	mediaSharing: true,
	socialImageGenerator: true,
};

async function dismissPodcastPostPublishPromo( editorPage: EditorPage ): Promise< void > {
	const editorParent = await editorPage.getEditorParent();
	const dialog = editorParent
		.getByRole( 'dialog' )
		.filter( { hasText: 'Ready for the podcast version?' } )
		.first();

	const isVisible = await dialog
		.waitFor( { state: 'visible', timeout: 1000 } )
		.then( () => true )
		.catch( () => false );

	if ( ! isVisible ) {
		return;
	}

	await dialog.getByRole( 'button', { name: /close/i } ).first().click();
	await dialog.waitFor( { state: 'hidden', timeout: 5 * 1000 } );
}

const testCases: Array< {
	plan: string;
	platform: 'Simple' | 'Atomic';
	testAccountName: TestAccountName;
	features: Record<
		'resharing' | 'manualSharing' | 'mediaSharing' | 'socialImageGenerator',
		boolean
	>;
	isPrivate?: boolean;
} > = [];

if ( envVariables.JETPACK_TARGET === 'wpcom-deployment' ) {
	testCases.push( {
		plan: envVariables.TEST_ON_ATOMIC ? 'Paid' : 'Business',
		platform: envVariables.TEST_ON_ATOMIC ? 'Atomic' : 'Simple',
		testAccountName: getTestAccountByFeature( envToFeatureKey( envVariables ) ),
		features: features4BusinessPlan,
		isPrivate: envVariables.TEST_ON_ATOMIC && envVariables.ATOMIC_VARIATION === 'private',
	} );
} else {
	testCases.push(
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
		}
	);
}

/**
 * Tests features offered by Jetpack Social on a Simple site with Free plan.
 *
 * Keywords: Social, Jetpack, Publicize, Editor
 */
test.describe(
	'Social: Editor features',
	{ tag: [ tags.CALYPSO_PR, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		for ( const { plan, platform, testAccountName, features, isPrivate } of testCases ) {
			test.describe( `For ${ platform } sites with ${ plan } plan`, () => {
				// Connections load via a resolver that fetches on editor load, so
				// tests asserting on connection-dependent UI must mock before
				// navigating.
				async function setupEditor(
					page: Page,
					{ mockConnections = false } = {}
				): Promise< {
					editorPage: EditorPage;
					socialConnectionsManager: SocialConnectionsManager;
				} > {
					const editorPage = new EditorPage( page );

					const testAccount = new TestAccount( testAccountName );
					const siteId = testAccount.credentials.testSites?.primary?.id || 0;
					const siteSlug = testAccount.getSiteURL( { protocol: false } );
					const socialConnectionsManager = new SocialConnectionsManager( page, siteId );
					await testAccount.authenticate( page );

					if ( mockConnections ) {
						await socialConnectionsManager.mockSocialConnections();
						const connectionTestsReceived = socialConnectionsManager.waitForConnectionTests();
						await editorPage.visit( 'post', { siteSlug } );
						await connectionTestsReceived;
					} else {
						await editorPage.visit( 'post', { siteSlug } );
					}

					return { editorPage, socialConnectionsManager };
				}

				test( 'Should verify that auto-sharing is available for new posts', async ( { page } ) => {
					test.skip( isPrivate ?? false, 'Skipped on private sites' );

					const { editorPage } = await setupEditor( page, { mockConnections: true } );

					// Open the Jetpack sidebar.
					await editorPage.openSettings( 'Jetpack' );

					// Expand the Publicize panel.
					const section = await editorPage.expandSection( 'Share to social media' );

					// Verify that the toggle is enabled.
					const toggle = section.getByLabel( 'Auto-share post' );
					await expect( toggle ).toBeChecked();

					// Verify that the message box is editable.
					const messageBox = section.getByRole( 'textbox', { name: 'Message' } );
					await expect( messageBox ).toBeEditable();

					// Verify whether the media button is available.
					const mediaButton = section.getByRole( 'button', { name: 'Select' } );
					await expect( mediaButton ).toBeVisible( { visible: features.mediaSharing } );
				} );

				test( `Should verify that resharing ${
					features.resharing ? 'IS' : 'is NOT'
				} available`, async ( { page } ) => {
					test.skip( isPrivate ?? false, 'Skipped on private sites' );

					const { editorPage, socialConnectionsManager } = await setupEditor( page, {
						mockConnections: true,
					} );

					// Open the Jetpack sidebar.
					await editorPage.openSettings( 'Jetpack' );

					// Expand the Publicize panel.
					let section = await editorPage.expandSection( 'Share to social media' );

					// Verify that resharing button is not visible on new posts in the share modal
					let sharePostModalButton = section.getByRole( 'button', {
						name: 'Preview and customize',
						exact: true,
					} );
					await sharePostModalButton.click();

					const shareModal = ( await editorPage.getEditorParent() ).getByRole( 'dialog' ).filter( {
						hasText: 'Preview and customize',
					} );

					await shareModal.waitFor();
					let reshareButton = shareModal.getByRole( 'button', { name: 'Share', exact: true } );

					await expect( reshareButton ).toBeHidden();

					let closeButton = shareModal.getByRole( 'button', { name: 'Close' } ).first();
					await closeButton.click();

					// Set a title for the post
					await editorPage.enterTitle( 'Resharing: ' + DataHelper.getRandomPhrase() );

					// Prevent pre-publish confirmation modal from being shown
					await page.evaluate(
						"wp.data.dispatch( 'core/preferences' ).set( 'jetpack/social', 'show_pre_publish_confirmation', false )"
					);

					// Publish the post.
					await editorPage.publish();
					const connectionTestPromise = socialConnectionsManager.waitForConnectionTests();
					await dismissPodcastPostPublishPromo( editorPage );
					await editorPage.closeAllPanels();

					// Open the Jetpack sidebar.
					await editorPage.openSettings( 'Jetpack' );

					await connectionTestPromise;

					// Expand the Publicize panel.
					section = await editorPage.expandSection( 'Share to social media' );

					// Verify whether the auto-share toggle is no longer visible.
					const toggle = section.getByLabel( 'Auto-share post' );
					await expect( toggle ).toBeHidden();

					// Check if the "Preview and share" button is visible based on resharing feature
					sharePostModalButton = section.getByRole( 'button', {
						name: 'Preview and share',
						exact: true,
					} );

					await expect( sharePostModalButton ).toBeVisible( { visible: features.resharing } );

					let isReshareButtonVisible = false;

					if ( features.resharing ) {
						await sharePostModalButton.click();

						const reshareModal = ( await editorPage.getEditorParent() )
							.getByRole( 'dialog' )
							.filter( {
								hasText: 'Customize and share to social media',
							} );
						await reshareModal.waitFor();

						// Look for the Share button within the modal dialog
						reshareButton = reshareModal.getByRole( 'button', { name: 'Share', exact: true } );
						isReshareButtonVisible = await reshareButton.isVisible();

						// Close the share post modal by clicking the Close button within the modal
						closeButton = reshareModal.getByRole( 'button', { name: 'Close' } ).first();
						await closeButton.click();
					}
					expect( isReshareButtonVisible ).toBe( features.resharing );

					// Verify whether the upgrade nudge/link is visible.
					if ( ! features.resharing ) {
						const upgradeButton = section.getByRole( 'button', { name: 'Upgrade now' } );
						// Wait for the upgrade button to appear.
						await upgradeButton.waitFor();
					}

					const content = await section.textContent();

					const message =
						'To re-share a post, you need to upgrade to the WordPress.com Premium plan';

					expect( content?.includes( message ) ).toBe( ! features.resharing );
				} );

				test( `Should verify that manual sharing ${
					features.manualSharing ? 'IS' : 'is NOT'
				} available`, async ( { page } ) => {
					test.skip( isPrivate ?? false, 'Skipped on private sites' );

					const { editorPage } = await setupEditor( page );

					// Open the Jetpack sidebar.
					await editorPage.openSettings( 'Jetpack' );

					// Expand the Publicize panel.
					let section = await editorPage.expandSection( 'Share to social media' );

					// Verify that manual sharing is NOT available before publishing.
					let manualSharing = section.getByRole( 'paragraph', { name: 'Manual sharing' } );
					await expect( manualSharing ).toBeHidden();

					// Set a title for the post
					await editorPage.enterTitle( 'Manual sharing: ' + DataHelper.getRandomPhrase() );

					// Prevent pre-publish confirmation modal from being shown
					await page.evaluate(
						"wp.data.dispatch( 'core/preferences' ).set( 'jetpack/social', 'show_pre_publish_confirmation', false )"
					);

					// Publish the post.
					await editorPage.publish();
					await dismissPodcastPostPublishPromo( editorPage );

					// Verify whether the manual sharing is available on post publish panel
					manualSharing = ( await editorPage.getPublishPanelRoot() ).getByRole( 'button', {
						name: 'Manual sharing',
					} );

					if ( features.manualSharing ) {
						await manualSharing.waitFor();
					}

					// Close the post publish panel.
					await editorPage.closeAllPanels();

					// Open the Jetpack sidebar.
					await editorPage.openSettings( 'Jetpack' );

					// Expand the Publicize panel.
					section = await editorPage.expandSection( 'Share to social media' );

					// Verify whether manual sharing is available in the Jetpack sidebar.
					manualSharing = section.getByText( 'Manual sharing' );
					await expect( manualSharing ).toBeVisible( { visible: features.manualSharing } );
				} );

				test( 'Should verify that Social Image Generator is available', async ( { page } ) => {
					test.skip( isPrivate ?? false, 'Skipped on private sites' );
					test.skip(
						! features.socialImageGenerator,
						'Social Image Generator is not available on this plan'
					);

					const { editorPage } = await setupEditor( page, { mockConnections: true } );

					// Open the Jetpack sidebar.
					await editorPage.openSettings( 'Jetpack' );

					// Expand the Publicize panel.
					const section = await editorPage.expandSection( 'Share to social media' );

					await section.getByRole( 'button', { name: 'Select' } ).click();

					const popoverGroup = page.getByRole( 'group', {
						name: 'Link preview',
					} );

					const templatebutton = popoverGroup.getByRole( 'menuitemradio', {
						name: 'Social image template',
					} );

					await expect( templatebutton ).toBeVisible();

					await expect( templatebutton ).toBeEnabled();
				} );
			} );
		}
	}
);
