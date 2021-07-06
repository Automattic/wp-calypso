/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	GutenbergEditorPage,
	PublishedPostPage,
	ClickToTweetBlock,
	PricingTableBlock
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Gutenberg: CoBlocks' ), function () {
	describe( 'Click to Tweet', function () {
		let gutenbergEditorPage;
		let insertedBlock;
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
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
			await gutenbergEditorPage.enterTitle( blockName );
		} );

		it( `Insert ${ blockName } block`, async function () {
			insertedBlock = await gutenbergEditorPage.addBlock( blockName );
		} );

		it( 'Enter tweet content', async function () {
			const block = new ClickToTweetBlock( insertedBlock );
			await block.enterTweetContent( tweet );
		} );

		it( 'Publish and visit post', async function () {
			await gutenbergEditorPage.publish( { visit: true } );
		} );

		it( `${blockName } block is visible in published post`, async function () {
			const publishedPostPage = await PublishedPostPage.Expect( this.page );
			await publishedPostPage.confirmBlockPresence( '.wp-block-coblocks-click-to-tweet' );
		} );
	} );

	describe( 'Pricing Table', function () {
		let gutenbergEditorPage;
		let insertedBlock;
		const blockName = 'Pricing Table';
		const price = '888'

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
			await loginFlow.logIn();
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( this.page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
			await gutenbergEditorPage.enterTitle( blockName );
		} );

		it( `Insert ${ blockName } block`, async function () {
			insertedBlock = await gutenbergEditorPage.addBlock( blockName );
		} );

		it( 'Enter pricing', async function () {
			const block = new PricingTableBlock( insertedBlock );
			await block.enterPrice( 'left', price );
		} );

		it( 'Publish and visit post', async function () {
			await gutenbergEditorPage.publish( { visit: true } );
		} );

		it( `${blockName } block is visible in published post`, async function () {
			const publishedPostPage = await PublishedPostPage.Expect( this.page );
			await publishedPostPage.confirmBlockPresence( '.wp-block-coblocks-pricing-table' );
		} );
	} );

	// Parametrized test.
	[
		[ 'Dynamic HR', 'dynamic-separator' ],
		[ 'Hero', 'hero' ],
	].forEach( function ( [ blockName, selector ] ) {
		describe( `${blockName}`, function () {
			let gutenbergEditorPage;
			let insertedBlock;

			it( 'Log in', async function () {
				const loginFlow = new LoginFlow( this.page, 'gutenbergSimpleSiteUser' );
				await loginFlow.logIn();
			} );

			it( 'Start new post', async function () {
				const newPostFlow = new NewPostFlow( this.page );
				await newPostFlow.newPostFromNavbar();
			} );

			it( 'Enter post title', async function () {
				gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
				await gutenbergEditorPage.enterTitle( blockName );
			} );

			it( `Insert ${ blockName } block`, async function () {
				insertedBlock = await gutenbergEditorPage.addBlock( blockName );
			} );

			it( 'Publish and visit post', async function () {
				await gutenbergEditorPage.publish( { visit: true } );
			} );

			it( `${blockName } block is visible in published post`, async function () {
				const publishedPostPage = await PublishedPostPage.Expect( this.page );
				await publishedPostPage.confirmBlockPresence( `.wp-block-coblocks-${selector}` );
			} );
		} );
	});
} );
