import { Locator } from 'playwright';
import { envVariables } from '../../..';
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
interface ValidationData {
	keywords: string[];
}

const TIMEOUT = envVariables.TEST_ON_ATOMIC ? 30 * 1000 : 15 * 1000;

/**it com
 * Represents the flow of using the AI Assistant block.
 */
export class AIAssistantFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private validationData: ValidationData;

	/**
	 * Constructs an instance of this block flow with data to be used when
	 * configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData Configuration data for the block.
	 */
	constructor( configurationData: ConfigurationData, validationData: ValidationData ) {
		this.configurationData = configurationData;
		this.validationData = validationData;
	}

	blockSidebarName = 'AI Assistant';
	blockEditorSelector = 'div[aria-label="Block: AI Assistant"]';

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
		const input = block.getByRole( 'textbox', { name: 'Write about… Make a table for…' } );
		await input.waitFor();
		await input.fill( this.configurationData.query );
	}

	/**
	 * Helper method to wait for the query to complete.
	 *
	 * @param {Locator} block Locator to the block.
	 */
	private async waitForQuery( block: Locator ) {
		const stopButton = block.getByRole( 'button', { name: 'Stop request' } );
		try {
			await stopButton.waitFor( { state: 'detached', timeout: TIMEOUT } );
		} catch {
			// Stop the generation request after the timeout is met.
			// AI Assistant block will retain any generated
			// text up to this point.
			await stopButton.click();
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at
	 * the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		for ( const keyword of this.validationData.keywords ) {
			try {
				await context.page.getByRole( 'main' ).filter( { hasText: keyword } ).waitFor();
			} catch {
				// Sometimes, the AI block fails to generate anything meaningful and isntead returns
				// an error text. We can wait on that, but that would be testing implementation details.
				// Since the AI block ends up creating paragraph blocks which are indistinguishable
				// from what a user would have typed manually, the fallback is to merely verify that some
				// form of paragraph block is present.
				// @see: p1694596605435499-slack-CDLH4C1UZ
				await context.page.getByRole( 'main' ).getByRole( 'paragraph' ).first().waitFor();
			}
		}
	}
}
