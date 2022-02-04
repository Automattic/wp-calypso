import { BlockFlow, EditorContext, PublishedPostContext } from '..';
import { createTestFile } from '../../../media-helper';

interface ConfigurationData {
	imagePaths: string[];
}

const blockParentSelector = '[aria-label="Block: Tiled Gallery"]';
const selectors = {
	fileInput: `${ blockParentSelector } input[type=file]`,
	uploadingIndicator: `${ blockParentSelector } .components-spinner`,
	publishedImage: ( fileName: string ) =>
		`.wp-block-jetpack-tiled-gallery img[src*="${ fileName }"]`,
};

/**
 * Class representing the flow of using a Contact Info block in the editor.
 */
export class TiledGalleryBlockFlow implements BlockFlow {
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

	blockSidebarName = 'Tiled Gallery';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		for ( const imagePath of this.configurationData.imagePaths ) {
			// Always make a duplicate test version first.
			const testFile = await createTestFile( imagePath );
			// We keep track of the names for later validation.
			this.preparedImageFileNames.push( testFile.basename );
			await context.editorIframe.setInputFiles( selectors.fileInput, testFile.fullpath );
			await context.editorIframe.waitForSelector( selectors.uploadingIndicator, {
				state: 'detached',
			} );
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		for ( const imageFileName of this.preparedImageFileNames ) {
			await context.page.waitForSelector( selectors.publishedImage( imageFileName ) );
		}
	}
}
