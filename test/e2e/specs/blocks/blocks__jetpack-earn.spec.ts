import {
	BlockFlow,
	DonationsFormFlow,
	AdFlow,
	PaywallFlow,
	EditorPage,
	EditorContext,
	PublishedPostContext,
	envVariables,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Blocks: Jetpack Earn',
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can add and configure Jetpack Earn blocks', async ( {
			browser,
			page,
			accountGivenByEnvironment,
			helperData,
		} ) => {
			const blockFlows: BlockFlow[] = [
				// Skip OpenTable block test for now, block is broken due to upstream API changes.
				// https://github.com/Automattic/jetpack/issues/39410
				new DonationsFormFlow(
					{
						frequency: 'Yearly',
						currency: 'CAD',
					},
					{
						frequency: 'Yearly',
						customAmount: 50,
						predefinedAmount: 5,
					}
				),
			];

			// The Ad block is only available on more premium plans that imply AT.
			// Furthermore, private sites are not eligible to monetize due to the site
			// being, well, private.
			if (
				envVariables.JETPACK_TARGET === 'wpcom-deployment' &&
				envVariables.TEST_ON_ATOMIC === true &&
				envVariables.ATOMIC_VARIATION !== 'private'
			) {
				blockFlows.push( new AdFlow( {} ) );
			}

			// Paywall also does not apply to Private sites.
			if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
				// Splice instead of push because the Donations block should be the last item
				// because clicking "Pay now" behavior is slightly unpredictable.
				blockFlows.splice(
					-1,
					0,
					new PaywallFlow( {
						prePaywallText: 'Pre-paywall text',
						postPaywallText: 'Post-paywall text',
					} )
				);
			}

			let editorPage: EditorPage;
			let editorContext: EditorContext;
			let publishedPostContext: PublishedPostContext;

			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'When I go to the new post page', async function () {
				editorPage = new EditorPage( page );
				await editorPage.visit( 'post' );
			} );

			await test.step( 'And I enter post title', async function () {
				await editorPage.enterTitle(
					`Blocks: Jetpack Earn - ${ helperData.getDateString( 'ISO-8601' ) }`
				);
			} );

			for ( const blockFlow of blockFlows ) {
				const blockName = blockFlow.blockTestName ?? blockFlow.blockSidebarName;

				await test.step( `And I add the ${ blockName } block from the sidebar`, async function () {
					const blockHandle = await editorPage.addBlockFromSidebar(
						blockFlow.blockSidebarName,
						blockFlow.blockEditorSelector,
						{
							noSearch: blockFlow.noSearch === false ? false : true,
							blockFallBackName: blockFlow.blockTestFallBackName,
							blockInsertedPopupConfirmButtonSelector:
								blockFlow.blockInsertedPopupConfirmButtonSelector,
						}
					);
					const id = await blockHandle.getAttribute( 'id' );
					const editorCanvas = await editorPage.getEditorCanvas();
					const addedBlockLocator = editorCanvas.locator( `#${ id }` );
					editorContext = {
						page,
						editorPage,
						addedBlockLocator,
					};
				} );

				await test.step( `And I configure the ${ blockName } block`, async function () {
					if ( blockFlow.configure ) {
						await blockFlow.configure( editorContext );
					}
				} );

				await test.step( `Then there are no block warnings or errors for ${ blockName }`, async function () {
					expect( await editorPage.editorHasBlockWarnings() ).toBe( false );
				} );
			}

			await test.step( 'When I publish and visit the post', async function () {
				await editorPage.publish( { visit: true, timeout: 15 * 1000 } );
				publishedPostContext = {
					browser: browser,
					page: page,
				};
			} );

			for ( const blockFlow of blockFlows ) {
				const blockName = blockFlow.blockTestName ?? blockFlow.blockSidebarName;

				await test.step( `Then the ${ blockName } block content is visible in the published post`, async function () {
					if ( blockFlow.validateAfterPublish ) {
						await blockFlow.validateAfterPublish( publishedPostContext );
					}
				} );
			}
		} );
	}
);
