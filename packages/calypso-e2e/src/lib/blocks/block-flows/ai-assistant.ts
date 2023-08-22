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
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		await this.initialQuery( editorCanvas );

		if ( this.configurationData.tone ) {
			await this.changeTone( editorCanvas );
		}

		if ( this.configurationData.improve ) {
			await this.improve( editorCanvas );
		}

		await this.accept( editorCanvas );
	}

	/**
	 * Fill the text input with the initial query and submit.
	 *
	 * @param {Locator} editorCanvas Locator to the editor.
	 */
	private async initialQuery( editorCanvas: Locator ) {
		const anchor = editorCanvas.getByRole( 'document', {
			name: `Block: ${ this.blockSidebarName }`,
		} );

		// Fill in the query into the input field.
		await anchor
			.getByRole( 'textbox', { name: 'Ask Jetpack AI' } )
			.fill( this.configurationData.query );

		await anchor.getByRole( 'button', { name: 'Send' } ).click();

		// Wait for the query and text generation to complete.
		await this.waitForQuery( anchor );
	}

	/**
	 * Clicks on the tone specified in the configuration data.
	 *
	 * @param {Locator} editorCanvas Locator to the editor.
	 */
	private async changeTone( editorCanvas: Locator ) {
		const anchor = editorCanvas.getByRole( 'toolbar', { name: 'Block tools' } );

		await anchor.getByRole( 'button', { name: 'Change tone' } ).click();
		await editorCanvas
			.getByRole( 'menu', { name: 'Change tone' } )
			.getByRole( 'menuitem', { name: this.configurationData.tone } )
			.click();

		// Wait for the query and text generation to complete.
		await this.waitForQuery( anchor );
	}

	/**
	 * Clicks on the improve option specified in the configuration data.
	 *
	 * @param {Locator} editorCanvas Locator to the editor.
	 */
	private async improve( editorCanvas: Locator ) {
		const anchor = editorCanvas.getByRole( 'toolbar', { name: 'Block tools' } );

		await anchor.getByRole( 'button', { name: 'Improve' } ).click();
		await editorCanvas
			.getByRole( 'menu', { name: 'Improve' } )
			.getByRole( 'menuitem', { name: this.configurationData.improve } )
			.click();

		// Wait for the query and text generation to complete.
		await this.waitForQuery( anchor );
	}

	/**
	 * Accepts the generated text.
	 *
	 * @param {Locator} editorCanvas Locator to the editor.
	 */
	private async accept( editorCanvas: Locator ) {
		const anchor = editorCanvas.getByRole( 'document', {
			name: `Block: ${ this.blockSidebarName }`,
		} );

		// Accept the query and confirm the AI Assistant block is replaced.
		await anchor.getByRole( 'button', { name: 'Accept' } ).click();
		await anchor.waitFor( { state: 'detached' } );

		this.generatedText = await editorCanvas.locator( '.is-selected' ).innerText();
	}

	/**
	 * Helper method to wait for the query to complete.
	 *
	 * @param {Locator} anchor The root locator of the block.
	 */
	private async waitForQuery( anchor: Locator ) {
		await anchor
			.getByRole( 'button', { name: 'Stop request' } )
			.waitFor( { state: 'detached', timeout: 15 * 1000 } );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.getByRole( 'main' ).getByText( this.generatedText ).waitFor();
	}
}
