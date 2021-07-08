/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	ClicktoTweetBlock,
} from '@automattic/calypso-e2e';

// This test has been isolated in its own file due to the following issue:
// https://github.com/Automattic/wp-calypso/issues/54421
// This issue causes interference with the post-publish panel being auto-dismissed.
describe( DataHelper.createSuiteTitle( 'Gutenberg: CoBlocks: Click to Tweet' ), function () {
	let gutenbergEditorPage;
	let clickToTweetBlock;
	const blockName = 'Click to Tweet';
	const tweet =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( this.page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( blockName );
	} );

	it( `Insert ${ blockName } block`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( blockName );
		clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
	} );

	it( 'Enter tweet content', async function () {
		await clickToTweetBlock.enterTweetContent( tweet );
	} );

	it( 'Publish and visit post', async function () {
		await gutenbergEditorPage.publish( { visit: true } );
	} );

	it( `${ blockName } block is visible in published post`, async function () {
		const publishedPostPage = await PublishedPostPage.Expect( this.page );
		await publishedPostPage.confirmBlockPresence( '.wp-block-coblocks-click-to-tweet' );
	} );
} );
