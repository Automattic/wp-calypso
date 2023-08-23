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
}

/**
 * Represents the flow of using an Ad block.
 */
export class AIAssistantFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private generatedText: string;
	/**
	 * Constructs an instance of this block flow with data to be used when
	 * configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData Configuration data for the block.
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
		this.generatedText = '';
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
		await this.waitForQuery( editorCanvas );

		if ( this.configurationData.tone ) {
			await this.clickToolbarButton( 'Change tone', this.configurationData.tone, context );
			await this.waitForQuery( editorCanvas );
		}

		if ( this.configurationData.improve ) {
			await this.clickToolbarButton( 'Improve', this.configurationData.improve, context );
			await this.waitForQuery( editorCanvas );
		}

		await this.clickButtonOnBlock( block, 'Accept' );
		await block.waitFor( { state: 'detached' } );
		this.generatedText = await editorCanvas.locator( '.is-selected' ).innerText();
	}

	/**
	 * Clicks on the toolbar button, then in the dropdown that appears, clicks an option.
	 *
	 * @param {string} buttonName Name of the button to click.
	 * @param {string} optionName Name of the option in the dropdown to click.
	 * @param {EditorContext} context The current context for the editor at the point of
	 * test execution.
	 */
	private async clickToolbarButton(
		buttonName: string,
		optionName: string,
		context: EditorContext
	) {
		// Block-based and non-block-based themes strike again.
		// For block-based themes (eg. Twenty Twenty-Three) a given block's toolbar
		// lives "outside" of the DOM tree returned by `getEditorCanvas`.
		// For non-block-based themes (eg. Twenty Twenty-One) a block's toolbar
		// lives in the same DOM tree as the locator returned by `getEditorCanvas`.
		// However, the locator returned by `getEditorParent` has the toolbar inside
		// the DOM tree in both cases.
		const editorParent = await context.editorPage.getEditorParent();

		const toolbar = editorParent.getByRole( 'toolbar', { name: 'Block tools' } );
		await toolbar.waitFor();
		// Yes, yuck, I know. But Playwright often tries to act on the buttons sooner
		// than it should, so we need to wait for the bounding box of the element here
		// to be stable before attempting to click on the toolbar.
		const elementHandle = await toolbar.elementHandle();
		await elementHandle?.waitForElementState( 'stable' );

		const button = toolbar.getByRole( 'button', { name: buttonName } );
		await button.waitFor();
		await button.click();

		const option = editorParent.getByRole( 'menuitem', { name: optionName } );
		await option.waitFor();
		await option.click();
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
		await Promise.all( [
			block
				.getByRole( 'button', { name: 'Stop request' } )
				.waitFor( { state: 'detached', timeout: 15 * 1000 } ),
			block
				.getByRole( 'textbox', { name: 'Ask Jetpack AI', disabled: true } )
				.waitFor( { state: 'detached', timeout: 15 * 1000 } ),
			block.locator( '.components-spinner' ).waitFor( { state: 'detached' } ),
		] );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at
	 * the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.getByRole( 'main' ).getByText( this.generatedText ).waitFor();
	}
}
