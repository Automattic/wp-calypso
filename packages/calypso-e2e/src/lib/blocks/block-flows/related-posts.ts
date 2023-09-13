import { BlockFlow, EditorContext, PublishedPostContext } from '.';

/**
 * Represents the flow of using the AI Assistant block.
 */
export class RelatedPostsFlow implements BlockFlow {
	blockSidebarName = 'Related Posts';
	blockEditorSelector = 'div[aria-label="Block: Related Posts"]';

	private noRelatedPosts = false;

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
			await publishedBlock.waitFor( { state: 'detached' } );
		} else {
			// For sites with related posts, the block will render.
			await publishedBlock.waitFor();
		}
	}
}
