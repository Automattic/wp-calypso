/**
 * @group gutenberg
 * @group coblocks
 */
import {
	setupHooks,
	BrowserHelper,
	DataHelper,
	MediaHelper,
	GutenbergEditorPage,
	TestFile,
	ClicktoTweetBlock,
	CoverBlock,
	DynamicHRBlock,
	HeroBlock,
	ImageBlock,
	LogosBlock,
	PricingTableBlock,
	NewPostFlow,
} from '@automattic/calypso-e2e';
import { Frame, Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

const user = BrowserHelper.targetCoBlocksEdge()
	? 'coBlocksSimpleSiteEdgeUser'
	: 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'CoBlocks' ), () => {
	let page: Page;
	let newPostFlow: NewPostFlow;
	let gutenbergEditorPage: GutenbergEditorPage;

	setupHooks( ( args ) => {
		page = args.page;
		page.on( 'dialog', async ( dialog ) => {
			await dialog.accept();
		} );
		newPostFlow = new NewPostFlow( page );
	} );

	afterEach( async () => {
		// Prevents the autosave so we don't see the "restore from autosave" message.
		await page.evaluate( () => {
			window.sessionStorage.clear();
		} );
	} );

	describe( 'Blocks', function () {
		let pricingTableBlock: PricingTableBlock;
		let logoImage: TestFile;

		// Test data
		const pricingTableBlockPrice = 888;
		const heroBlockHeading = 'Hero heading';
		const clicktoTweetBlockTweet = 'Tweet text';

		beforeAll( async () => {
			logoImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
			gutenbergEditorPage = await newPostFlow.startImmediately( user );
		} );

		it( `Insert ${ PricingTableBlock.blockName } block and enter price to left table`, async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				PricingTableBlock.blockName,
				PricingTableBlock.blockEditorSelector
			);
			pricingTableBlock = new PricingTableBlock( blockHandle );
			await pricingTableBlock.enterPrice( 1, pricingTableBlockPrice );
		} );

		it( `Insert ${ DynamicHRBlock.blockName } block`, async function () {
			await gutenbergEditorPage.addBlock(
				DynamicHRBlock.blockName,
				DynamicHRBlock.blockEditorSelector
			);
		} );

		it( `Insert ${ HeroBlock.blockName } block and enter heading`, async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				HeroBlock.blockName,
				HeroBlock.blockEditorSelector
			);
			const heroBlock = new HeroBlock( blockHandle );
			await heroBlock.enterHeading( heroBlockHeading );
		} );

		it( `Insert ${ ClicktoTweetBlock.blockName } block and enter tweet content`, async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ClicktoTweetBlock.blockName,
				ClicktoTweetBlock.blockEditorSelector
			);
			const clickToTweetBlock = new ClicktoTweetBlock( blockHandle );
			await clickToTweetBlock.enterTweetContent( clicktoTweetBlockTweet );
		} );

		it( `Insert ${ LogosBlock.blockName } block and set image`, async function () {
			const blockHandle = await gutenbergEditorPage.addBlock(
				LogosBlock.blockName,
				LogosBlock.blockEditorSelector
			);
			const logosBlock = new LogosBlock( blockHandle );
			await logosBlock.upload( logoImage.fullpath );
		} );

		it( 'Publish and visit post', async function () {
			await gutenbergEditorPage.publish( { visit: true } );
		} );

		// Pass in a 1D array of values or text strings to validate each block.
		it.each`
			block                  | content
			${ PricingTableBlock } | ${ [ pricingTableBlockPrice ] }
			${ DynamicHRBlock }    | ${ null }
			${ HeroBlock }         | ${ [ heroBlockHeading ] }
			${ ClicktoTweetBlock } | ${ [ clicktoTweetBlockTweet ] }
		`(
			`Confirm $block.blockName block is visible in published post`,
			async ( { block, content } ) => {
				// Pass the Block object class here then call the static method to validate.
				await block.validatePublishedContent( page, content );
			}
		);

		it( `Confirm Logos block is visible in published post`, async () => {
			await LogosBlock.validatePublishedContent( page, [ logoImage.filename ] );
		} );
	} );

	describe( 'Extensions', () => {
		describe( 'Gutter Control', () => {
			let pricingTableBlock: PricingTableBlock;

			beforeAll( async () => {
				gutenbergEditorPage = await newPostFlow.startImmediately( user );
			} );

			it( 'Insert Pricing Table block', async function () {
				const blockHandle = await gutenbergEditorPage.addBlock(
					PricingTableBlock.blockName,
					PricingTableBlock.blockEditorSelector
				);
				pricingTableBlock = new PricingTableBlock( blockHandle );
			} );

			it( 'Open settings sidebar', async function () {
				await gutenbergEditorPage.openSettings();
			} );

			it.each( PricingTableBlock.gutterValues )( 'Set gutter value to %s', async ( value ) => {
				await pricingTableBlock.setGutter( value );
			} );
		} );

		describe( 'Replace Image', () => {
			let imageBlock: ImageBlock;
			let imageFile: TestFile;
			let uploadedImagePath: string;

			beforeAll( async () => {
				imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
				gutenbergEditorPage = await newPostFlow.startImmediately( user );
			} );

			it( `Insert ${ ImageBlock.blockName } block and upload image`, async () => {
				const blockHandle = await gutenbergEditorPage.addBlock(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector
				);
				imageBlock = new ImageBlock( blockHandle );
				const uploadedImage = await imageBlock.upload( imageFile.fullpath );
				uploadedImagePath = ( await uploadedImage.getAttribute( 'src' ) ) as string;
			} );

			it( `Replace uploaded image`, async () => {
				const editorFrame = await gutenbergEditorPage.getEditorFrame();

				await editorFrame.click( 'button:text("Replace")' );
				await editorFrame.setInputFiles(
					'.components-form-file-upload input[type="file"]',
					imageFile.fullpath
				);
				await imageBlock.waitUntilUploaded();
				const newImage = await imageBlock.getImage();
				const newImagePath = await newImage.getAttribute( 'src' );

				expect( uploadedImagePath ).not.toBe( newImagePath );
			} );
		} );

		describe( 'Cover Styles', () => {
			let imageFile: TestFile;
			let coverBlock: CoverBlock;
			let editorFrame: Frame;

			beforeAll( async () => {
				imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
				gutenbergEditorPage = await newPostFlow.startImmediately( user );
				editorFrame = await gutenbergEditorPage.getEditorFrame();
			} );

			it( 'Insert Cover block', async () => {
				const blockHandle = await gutenbergEditorPage.addBlock(
					CoverBlock.blockName,
					CoverBlock.blockEditorSelector
				);
				coverBlock = new CoverBlock( blockHandle );
			} );

			it( 'Upload image', async () => {
				await coverBlock.upload( imageFile.fullpath );
				// After uploading the image the focus is switched to the inner
				// paragraph block (Cover title), so we need to switch it back outside.
				await editorFrame.click( '[aria-label="Select Cover"]' );
			} );

			it.each( CoverBlock.coverStyles )( 'Verify "%s" style is available', async ( style ) => {
				await gutenbergEditorPage.openSettings();
				await editorFrame.waitForSelector( `button[aria-label="${ style }"]` );
			} );

			it( 'Set "Bottom Wave" style', async () => {
				await coverBlock.setCoverStyle( 'Bottom Wave' );
			} );

			it( 'Publish post', async () => {
				await gutenbergEditorPage.publish( { visit: true } );
			} );

			it( 'Verify the class for "Bottom Wave" style is present', async () => {
				await page.waitForSelector( '.wp-block-cover.is-style-bottom-wave' );
			} );
		} );
	} );
} );
