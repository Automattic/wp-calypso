import { BlockFlow, EditorContext, PublishedPostContext } from '.';

/**
 * Represents the flow of using a Writing Prompt block.
 */
export class WritingPromptFlow implements BlockFlow {
	blockSidebarName = 'Writing Prompt';
	blockEditorSelector = 'div[aria-label="Block: Writing Prompt"]';

	private prompt: string | undefined;

	/**
	 * Constructs an instance of this block flow with data to be used when
	 * configuring and validating the block.
	 */
	constructor() {
		this.prompt = undefined;
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

		await block.locator( '.components-spinner' ).waitFor( { state: 'detached' } );

		// Must use CSS selector here due to lack of accessible locator
		// for the block components.
		this.prompt = await block.locator( '.jetpack-blogging-prompt__text' ).innerText();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at
	 * the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Check the prompt is the same.
		await context.page
			.getByRole( 'main' )
			.getByText( this.prompt as string )
			.waitFor();

		const newPagePromise = context.page.waitForEvent( 'popup' );
		await context.page
			.getByRole( 'main' )
			.getByRole( 'link', { name: 'View all responses' } )
			.click();
		const newPage = await newPagePromise;
		await newPage.waitForURL( /dailyprompt/ );
		await newPage.close();
	}
}
