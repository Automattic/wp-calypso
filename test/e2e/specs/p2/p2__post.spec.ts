import {
	DataHelper,
	P2Page,
	IsolatedBlockEditorComponent,
	ParagraphBlock,
} from '@automattic/calypso-e2e';
import { ElementHandle } from 'playwright';
import { tags, test } from '../../lib/pw-base';

test.describe( 'P2: Post', { tag: [ tags.P2 ] }, () => {
	const postContent = DataHelper.getTimestamp();

	test( 'As a P2 user, I can create and publish a post with a paragraph block', async ( {
		page,
		accountP2,
	} ) => {
		await test.step( 'Given I am authenticated as a P2 user', async function () {
			await accountP2.authenticate( page );
		} );

		await test.step( 'And I navigate to the P2 site', async function () {
			await page.goto( accountP2.getSiteURL(), { waitUntil: 'networkidle' } );
		} );

		let blockHandle: ElementHandle;
		let isolatedBlockEditorComponent: IsolatedBlockEditorComponent;

		await test.step( 'When I click to create a new post', async function () {
			const p2Page = new P2Page( page );
			await p2Page.clickNewPost();
		} );

		await test.step( 'And I add a Paragraph block', async function () {
			isolatedBlockEditorComponent = new IsolatedBlockEditorComponent( page );
			blockHandle = await isolatedBlockEditorComponent.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
		} );

		await test.step( 'And I enter text into the paragraph', async function () {
			const paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( postContent );
		} );

		await test.step( 'And I submit the post', async function () {
			await isolatedBlockEditorComponent.submitPost();
			// Click twice since the first "Publish" click will open the publish confirmation sidebar
			await isolatedBlockEditorComponent.submitPost();
		} );

		await test.step( 'Then the post is published with the expected content', async function () {
			const p2Page = new P2Page( page );
			await p2Page.validatePostContent( postContent );
		} );
	} );
} );
