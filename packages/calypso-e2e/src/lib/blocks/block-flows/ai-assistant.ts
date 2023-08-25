import { Locator } from 'playwright';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	query: string;
	tone?:
		| 'Formal'
		| 'Informal'
		| 'Optimistic'
		| 'Humorous'
		| 'Serious'
		| 'Skeptical'
		| 'Empathetic'
		| 'Confident'
		| 'Passionate'
		| 'Provocative';
	improve?: 'Summarize' | 'Make longer' | 'Make shorter';
	keywords: string[];
}

/**
 * Represents the flow of using the AI Assistant block.
 */
export class AIAssistantFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when
	 * configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData Configuration data for the block.
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'AI Assistant (Experimental)';
	blockEditorSelector = 'div[aria-label="Block: AI Assistant (Experimental)"]';

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

		await this.enterInput( block );
		await this.clickButtonOnBlock( block, 'Send' );
		await this.waitForQuery( block );

		if ( this.configurationData.tone ) {
			await context.editorPage.clickBlockToolbarButton( { name: 'Change tone' } );
			await context.editorPage.selectFromToolbarPopover( this.configurationData.tone );
			await this.waitForQuery( block );
		}

		if ( this.configurationData.improve ) {
			await context.editorPage.clickBlockToolbarButton( { name: 'Improve' } );
			await context.editorPage.selectFromToolbarPopover( this.configurationData.improve );
			await this.waitForQuery( block );
		}

		await this.clickButtonOnBlock( block, 'Accept' );
		await block.waitFor( { state: 'detached' } );
	}

	/**
	 * Clicks on a button on the block.
	 *
	 * @param {Locator} block Locator to the block.
	 * @param {string}name Name of the button to click.
	 */
	private async clickButtonOnBlock( block: Locator, name: string ) {
		await block.getByRole( 'button', { name: name } ).click();
	}

	/**
	 * Enters the query into the input on the block.
	 *
	 * @param {Locator} block Locator to the block.
	 */
	private async enterInput( block: Locator ) {
		await block
			.getByRole( 'textbox', { name: 'Ask Jetpack AI' } )
			.fill( this.configurationData.query );
	}

	/**
	 * Helper method to wait for the query to complete.
	 *
	 * @param {Locator} block Locator to the block.
	 */
	private async waitForQuery( block: Locator ) {
		// Some users on AT are very slow to process queries, hence the very long
		// timeout.
		await block
			.getByRole( 'button', { name: 'Stop request' } )
			.waitFor( { state: 'detached', timeout: 30 * 1000 } );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at
	 * the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		for ( const keyword of this.configurationData.keywords ) {
			await context.page.getByRole( 'main' ).filter( { hasText: keyword } ).waitFor();
		}
	}
}
