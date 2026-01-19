import {
	BlockFlow,
	BusinessHoursFlow,
	WhatsAppButtonFlow,
	PaidContentBlockFlow,
	SubscribeFlow,
	ContactInfoBlockFlow,
	EditorPage,
	EditorContext,
	PublishedPostContext,
	DataHelper,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	'Blocks: Jetpack Grow',
	{ tag: [ tags.GUTENBERG, tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		test( 'As a user, I can add and configure Jetpack Grow blocks', async ( {
			browser,
			page,
			accountGivenByEnvironment,
			helperData,
		} ) => {
			const blockFlows: BlockFlow[] = [
				new BusinessHoursFlow( { day: 'Sat' } ),
				new SubscribeFlow(),
				new ContactInfoBlockFlow( { email: 'foo@example.com', phoneNumber: '(213) 621-0002' } ),
				new WhatsAppButtonFlow( { phoneNumber: 1234567890, buttonText: 'Porpoises swim happily' } ),
				new PaidContentBlockFlow( {
					subscriberTitle: DataHelper.getRandomPhrase(),
					subscriberText: DataHelper.getRandomPhrase(),
				} ),
			];

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
					`Blocks: Jetpack Grow - ${ helperData.getDateString( 'ISO-8601' ) }`
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
