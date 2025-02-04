import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	headline?: string;
}

/**
 * Represents the flow of using the Related Posts block.
 *
 * Note, this block must be turned on from Jetpack Settings > Traffic for AT sites.
 */
export class RelatedPostsFlow implements BlockFlow {
	blockSidebarName = 'Related Posts';
	blockEditorSelector = 'div[aria-label="Block: Related Posts"]';

	private configurationData: ConfigurationData;
	private noRelatedPosts = false;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of
	 * test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		await context.addedBlockLocator.waitFor();

		if ( this.configurationData.headline ) {
			await context.addedBlockLocator
				.getByRole( 'document', { name: 'Block: Heading' } )
				.fill( this.configurationData.headline );
		}
	}

	/**
	 * Validate the block in the published post.
	 *
	 * @param {PublishedPostContext} context The current context for the published post at
	 * the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const publishedBlock = context.page.locator( '.wp-block-jetpack-related-posts' );

		try {
			await publishedBlock.waitFor();
		} catch {
			// noop - exit the method, since the locator cannot be found.
			return;
		}

		if ( this.configurationData.headline ) {
			await publishedBlock
				.getByRole( 'heading', { name: this.configurationData.headline } )
				.waitFor();
		}
	}
}
