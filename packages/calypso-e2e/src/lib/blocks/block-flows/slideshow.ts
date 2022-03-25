import { BlockFlow, EditorContext, PublishedPostContext } from '..';
import { createTestFile } from '../../../media-helper';

interface ConfigurationData {
	imagePaths: string[];
}

const blockParentSelector = '[aria-label="Block: Slideshow"]';
const selectors = {
	fileInput: `${ blockParentSelector } input[type=file]`,
	uploadingIndicator: `${ blockParentSelector } .components-spinner`,
	publishedImage: ( fileName: string ) => `.wp-block-jetpack-slideshow img[src*="${ fileName }"]`,
};

/**
 * Class representing the flow of using a Slideshow block in the editor.
 */
export class SlideshowBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private preparedImageFileNames: string[];

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
		this.preparedImageFileNames = [];
	}

	blockSidebarName = 'Slideshow';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		for ( const imagePath of this.configurationData.imagePaths ) {
			// Always make a duplicate "test" version of the image to preserve the original.
			const testFile = await createTestFile( imagePath );
			// We keep track of the names for later validation in the published post.
			this.preparedImageFileNames.push( testFile.basename );

			const fileInputLocator = context.editorLocator.locator( selectors.fileInput );
			await fileInputLocator.setInputFiles( testFile.fullpath );

			const uploadingIndicatorLocator = context.editorLocator.locator(
				selectors.uploadingIndicator
			);
			await uploadingIndicatorLocator.waitFor( { state: 'detached' } );
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		for ( const imageFileName of this.preparedImageFileNames ) {
			const expectedImageLocator = context.page.locator(
				selectors.publishedImage( imageFileName )
			);
			// The image not be visible if it's not the current slide, so we just want 'attached' state.
			await expectedImageLocator.waitFor( { state: 'attached' } );
		}
	}
}
