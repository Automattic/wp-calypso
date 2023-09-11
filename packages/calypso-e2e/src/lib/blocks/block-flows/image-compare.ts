import { createTestFile } from '../../../media-helper';
import { TestFile } from '../../../types';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	image1Path: string;
	image2Path: string;
}

const blockParentSelector = '[aria-label="Block: Image Compare"]';

/**
 * Class representing the flow of using a Image Compare block in the editor.
 */
export class ImageCompareFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private preparedImageFileNames: TestFile[];

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
		this.preparedImageFileNames = [];
	}

	blockSidebarName = 'Image Compare';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const block = editorCanvas.getByRole( 'document', { name: 'Block: Image Compare' } );

		const image1UploadInput = block.locator( 'input' ).first();
		const image2UploadInput = block.locator( 'input' ).last();

		const testFile1 = await createTestFile( this.configurationData.image1Path );
		const testFile2 = await createTestFile( this.configurationData.image2Path );
		this.preparedImageFileNames.push( testFile1 );
		this.preparedImageFileNames.push( testFile2 );

		await image1UploadInput.setInputFiles( testFile1.fullpath );
		await image2UploadInput.setInputFiles( testFile2.fullpath );

		// Slider is shown once the images are uploaded and ready.
		await block.getByRole( 'slider' ).waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const slider = context.page.getByRole( 'slider', { name: 'Slide to compare images' } );
		const originalBoundingBox = await slider.boundingBox();

		await slider.waitFor();
		// Hover over the slider not at the centre of the bounding box,
		// because the left/right arrows intercept the clicks.
		await slider.hover( { position: { x: 10, y: 10 } } );

		// It's uncertain what the number here refers to. It could be the
		// pixels, but the slider clearly doesn't move by 100px when the
		// test runs.
		await context.page.mouse.down();
		await context.page.mouse.move( -100, 0 );
		await context.page.mouse.up();

		const newBoundingBox = await slider.boundingBox();

		if ( ! originalBoundingBox || ! newBoundingBox ) {
			throw new Error( `Image Compare: Failed to obtain at least one or both bounding boxes.` );
		}
		// The slider should have moved.
		if ( originalBoundingBox.x === newBoundingBox.x ) {
			throw new Error(
				`Image Compare: slider did not move, expected slider position to be different from ${ originalBoundingBox.x }`
			);
		}
	}
}
