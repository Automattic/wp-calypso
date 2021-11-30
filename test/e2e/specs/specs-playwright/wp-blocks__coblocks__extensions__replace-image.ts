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
	ImageBlock,
	NewPostFlow,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

const user = BrowserHelper.targetCoBlocksEdge()
	? 'coBlocksSimpleSiteEdgeUser'
	: 'gutenbergSimpleSiteUser';

describe( DataHelper.createSuiteTitle( 'CoBlocks: Extensions: Replace Image' ), () => {
	let page: Page;
	let gutenbergEditorPage: GutenbergEditorPage;
	let imageBlock: ImageBlock;
	let imageFile: TestFile;
	let uploadedImageURL: string;
	let newImageURL: string;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		imageFile = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		gutenbergEditorPage = await new NewPostFlow( page ).startImmediately( user );
	} );

	it( `Insert ${ ImageBlock.blockName } block and upload image`, async () => {
		const blockHandle = await gutenbergEditorPage.addBlock(
			ImageBlock.blockName,
			ImageBlock.blockEditorSelector
		);
		imageBlock = new ImageBlock( blockHandle );
		const uploadedImage = await imageBlock.upload( imageFile.fullpath );
		uploadedImageURL = ( await uploadedImage.getAttribute( 'src' ) ) as string;
		uploadedImageURL = uploadedImageURL.split( '?' )[ 0 ];
	} );

	it( 'Publish the post', async () => {
		await gutenbergEditorPage.publish();
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
		newImageURL = ( await newImage.getAttribute( 'src' ) ) as string;
		newImageURL = newImageURL.split( '?' )[ 0 ];

		expect( newImageURL ).not.toEqual( uploadedImageURL );
	} );

	it( 'Update and visit the post', async () => {
		await gutenbergEditorPage.publish( { update: true, visit: true } );
	} );

	it( 'Verify the new image was published', async () => {
		// Image is not always immediately available on a published site, so
		// we need to refresh and check again until timeout or condition met.
		const timeout = 10000;
		const startTime = Date.now();

		async function verify(): Promise< void > {
			const publishedImage = await page.waitForSelector( '.wp-block-image img' );
			const publishedImageURL = ( await publishedImage.getAttribute( 'src' ) ) as string;

			try {
				expect( publishedImageURL.split( '?' )[ 0 ] ).toEqual( newImageURL );
			} catch ( error ) {
				if ( Date.now() - timeout >= startTime ) {
					throw error;
				}
				await page.reload();
				return await verify();
			}
		}

		await verify();
	} );
} );
