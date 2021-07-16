import {
	setupHooks,
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	ClicktoTweetBlock,
} from '@automattic/calypso-e2e';

// This test has been isolated in its own file due to the following issue:
// https://github.com/Automattic/wp-calypso/issues/54421
// which causes interference with the post-publish panel being auto-dismissed if this block is present.
// Once the issue is fixed, combine this test into the main coblock test.
describe( DataHelper.createSuiteTitle( 'Gutenberg: CoBlocks: Click to Tweet' ), () => {
	let gutenbergEditorPage;
	let clickToTweetBlock;
	const tweet =
		'The foolish man seeks happiness in the distance. The wise grows it under his feet. — James Oppenheim';
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );
		await loginFlow.logIn();
	} );

	it( 'Start new post', async function () {
		const newPostFlow = new NewPostFlow( page );
		await newPostFlow.newPostFromNavbar();
		gutenbergEditorPage = await GutenbergEditorPage.Expect( page );
	} );

	it( 'Enter post title', async function () {
		await gutenbergEditorPage.enterTitle( 'Click to Tweet' );
	} );

	it( `Insert Click to Tweet block`, async function () {
		const blockHandle = await gutenbergEditorPage.addBlock( 'Click to Tweet' );
		clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
	} );

	it( 'Enter tweet content', async function () {
		await clickToTweetBlock.enterTweetContent( tweet );
	} );

	it( 'Publish and visit post', async function () {
		await gutenbergEditorPage.publish( { visit: true } );
		await PublishedPostPage.Expect( page );
	} );

	it( `Click to Tweet block is visible in published post`, async function () {
		await ClicktoTweetBlock.validatePublishedContent( page );
	} );
} );
