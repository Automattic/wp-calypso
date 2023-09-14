import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	headline?: string;
}

/**
 * Represents the flow of using the AI Assistant block.
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
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const block = editorCanvas.getByRole( 'document', {
			name: `Block: ${ this.blockSidebarName }`,
		} );

		await block.waitFor();

		if ( this.configurationData.headline ) {
			await context.editorPage.openSettings();
			await context.editorPage.clickSettingsTab( 'Block' );

			const editorParent = await context.editorPage.getEditorParent();
			// Toggle on the Headline text field.
			await editorParent.getByLabel( 'Display headline' ).click();
			// Fill the headline field.
			await editorParent
				.getByLabel( 'Headline', { exact: true } )
				.fill( this.configurationData.headline );
		}

		// This section requires understanding the implementation detail for this block a little.
		// In short, even on sites with many posts, this block renders a notice stating that preview
		// is unavailable.
		// When no related posts are actually available, the published page will not render the block.
		// If the number of "Preview unavailable" message corresponds to the number of available "slots",
		// the site really has no related posts thus the published page will not render this block.
		const noRelatedPostsNotice = await block.getByText( /Preview unavailable/ ).count();
		const postSlotCount = await block.getByRole( 'menuitem' ).count();

		if ( noRelatedPostsNotice === postSlotCount ) {
			this.noRelatedPosts = true;
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

		if ( this.noRelatedPosts ) {
			// For sites with no related posts at all, the block will not render.
			return await publishedBlock.waitFor( { state: 'detached' } );
		}

		// For sites with related posts, the block will render.
		await publishedBlock.waitFor();

		if ( this.configurationData.headline ) {
			await publishedBlock
				.getByRole( 'heading', { name: this.configurationData.headline } )
				.waitFor();
		}
	}
}
