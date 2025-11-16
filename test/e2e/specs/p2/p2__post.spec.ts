import { ParagraphBlock } from '@automattic/calypso-e2e';
import { test } from '../../lib/pw-base';

test.describe( 'P2: Post', () => {
	let postContent: string;

	test( 'Create and publish a post', async ( {
		page,
		accountP2User,
		pageP2,
		helperData,
		componentIsolatedBlockEditor,
	} ) => {
		postContent = helperData.getTimestamp();

		await test.step( 'View P2', async () => {
			await accountP2User.authenticate( page );
			await page.goto( accountP2User.getSiteURL(), { waitUntil: 'networkidle' } );
		} );

		await test.step( 'Add a Paragraph block', async () => {
			await pageP2.clickNewPost();

			const blockHandle = await componentIsolatedBlockEditor.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);

			await test.step( 'Enter text', async () => {
				const paragraphBlock = new ParagraphBlock( blockHandle );
				await paragraphBlock.enterParagraph( postContent );
			} );

			await test.step( 'Submit post', async () => {
				await componentIsolatedBlockEditor.submitPost();
				// Click twice since the first "Publish" click will open the publish confirmation sidebar
				await componentIsolatedBlockEditor.submitPost();
			} );
		} );

		await test.step( 'Validate post submission was successful', async () => {
			await pageP2.validatePostContent( postContent );
		} );
	} );
} );
