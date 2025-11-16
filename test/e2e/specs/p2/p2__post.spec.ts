import { IsolatedBlockEditorComponent, ParagraphBlock } from '@automattic/calypso-e2e';
import { test } from '../../lib/pw-base';

/**
 * Converted from Jest-style p2__post.ts to Playwright Test fixtures.
 * Tests P2 post creation using the isolated block editor.
 */
test.describe( 'P2: Post', () => {
	test( 'Create and publish a P2 post with paragraph block', async ( {
		page,
		accountP2User,
		pageP2,
		helperData,
	} ) => {
		// Generate unique post content using timestamp
		const postContent = helperData.getTimestamp();

		// Step 1: Authenticate and navigate to P2 site
		await accountP2User.authenticate( page );
		await page.goto( accountP2User.getSiteURL(), { waitUntil: 'networkidle' } );

		// Step 2: Open the new post editor
		await pageP2.clickNewPost();

		// Step 3: Add a Paragraph block using IsolatedBlockEditorComponent
		const isolatedBlockEditorComponent = new IsolatedBlockEditorComponent( page );
		const blockHandle = await isolatedBlockEditorComponent.addBlock(
			ParagraphBlock.blockName,
			ParagraphBlock.blockEditorSelector
		);

		// Step 4: Enter text into the paragraph block
		const paragraphBlock = new ParagraphBlock( blockHandle );
		await paragraphBlock.enterParagraph( postContent );

		// Step 5: Submit/publish the post
		// Note: First click opens publish confirmation, second click publishes
		await isolatedBlockEditorComponent.submitPost();
		await isolatedBlockEditorComponent.submitPost();

		// Step 6: Validate post submission was successful
		await pageP2.validatePostContent( postContent );
	} );
} );
