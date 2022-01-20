/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	GutenbergEditorPage,
	envVariables,
	TestAccount,
	PostsPage,
	ParagraphBlock,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Trash Page` ), function () {
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	const postTitle = `Trashed post: ${ DataHelper.getTimestamp() }`;
	const originalContent = DataHelper.getRandomPhrase();
	const additionalContent = 'Updated post content';

	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let paragraphBlock: ParagraphBlock;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );

		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.visit( 'post' );
	} );

	describe( 'Publish post', function () {
		it( 'Enter post title', async function () {
			await gutenbergEditorPage.enterTitle( postTitle );
		} );

		it( 'Enter post content', async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( originalContent );
		} );

		it( 'Publish post', async function () {
			const postURL = await gutenbergEditorPage.publish( { visit: true } );
			expect( postURL ).toBeDefined();
		} );

		it( 'Validate post', async function () {
			await ParagraphBlock.validatePublishedContent( page, [ originalContent ] );
		} );
	} );

	describe( 'Edit published post', function () {
		let postsPage: PostsPage;

		it( 'Navigate to Posts page', async function () {
			postsPage = new PostsPage( page );
			await postsPage.visit();
		} );

		it( 'Click on published post', async function () {
			await postsPage.clickPost( postTitle );
		} );

		it( 'Editor is shown', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.waitUntilLoaded();
		} );

		it( 'Append additional content', async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( additionalContent );
		} );

		it( 'Publish post', async function () {
			await gutenbergEditorPage.update( { visit: true } );
		} );
	} );

	describe( 'Validate post', function () {
		it( 'Published post contains additional post content', async function () {
			await ParagraphBlock.validatePublishedContent( page, [ originalContent, additionalContent ] );
		} );
	} );
} );
