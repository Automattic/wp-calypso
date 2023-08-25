import { Locator } from 'playwright';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ExpectedField {
	type: 'textbox' | 'checkbox' | 'radio' | 'combobox' | 'button';
	accessibleName: string;
}

interface ConfigurationData {
	labelPrefix: string;
	patternName: string;
	otherExpectedFields: ExpectedField[];
}

/**
 * Class representing the flow of using an block in the editor.
 */
export class FormPatternsFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Form';
	blockEditorSelector = 'div[aria-label="Block: Form"]';

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// Okay, this timeout wait is gross, but we really don't have any other options here.
		// For whatever reason, if you try to open the forms pattern modal too quickly, it will get dismissed.
		// After a lot of testing, there is no network request or anything reliable in the DOM that we can key off of.
		// And a loop design where you try to launch and see if you were successful is also flaky, because the check will
		// pass sometimes and then the modal will still get dismissed.
		// There must be some slow-ish Editor rerender that is dismissing the dialog.
		// This wait, although "against the rules", has proved to be the most reliable approach so far.
		await context.page.waitForTimeout( 2000 );
		await context.addedBlockLocator
			.getByRole( 'button', { name: 'Explore Form Patterns' } )
			.click();
		const editorParent = await context.editorPage.getEditorParent();
		await editorParent
			.getByRole( 'dialog', { name: 'Choose a pattern' } )
			// The a11y is a little bit messed up here -- the right label isn't directly assocaited with the option element.
			.locator( `[aria-label="${ this.configurationData.patternName }"]` )
			.getByRole( 'option' )
			// These patterns can load in quite slowly, messing with animation wait checks, so let's give extra time.
			.click( { timeout: 20 * 1000 } );

		const editorCanvas = await context.editorPage.getEditorCanvas();
		// Adding the pattern unfortunately wipes out the old parent Form block and replaces it with a new one.
		// So we have to grab a new parent locator ourselves instead of relying on the old on in the context.
		const newParentBlockId = await editorCanvas
			.locator( '[aria-label="Block: Form"].is-selected' )
			.getAttribute( 'id' );
		const newParentBlockLocator = editorCanvas.locator( `#${ newParentBlockId }` );

		// Name and Email are common fields shared amongst most Form patterns.
		// So let's make them unique here!
		await this.labelFieldBlock( newParentBlockLocator, 'Name Field' );
		await this.labelFieldBlock( newParentBlockLocator, 'Email Field' );
	}

	/** */
	private async openFormPatterns( context: EditorContext ) {
		const MAX_TRIES = 3;
		for ( let i = 0; i < MAX_TRIES; i++ ) {
			try {
				await context.addedBlockLocator
					.getByRole( 'button', { name: 'Explore Form Patterns' } )
					.click();
				const editorParent = await context.editorPage.getEditorParent();
				await editorParent
					.getByRole( 'dialog', { name: 'Choose a pattern' } )
					.waitFor( { timeout: 3000 } );
				return;
			} catch ( e ) {
				if ( i === MAX_TRIES - 1 ) {
					throw e;
				}
			}
		}
	}

	/** */
	private async labelFieldBlock( parentFormBlock: Locator, blockName: string ) {
		await parentFormBlock
			.locator( this.makeBlockSelector( blockName ) )
			.getByRole( 'textbox', { name: 'Add label…' } )
			.fill( this.addLabelPrefix( blockName ) );
	}

	/**
	 *
	 * @param label
	 * @returns
	 */
	private addLabelPrefix( label: string ): string {
		return `${ this.configurationData.labelPrefix } ${ label }`;
	}

	/**
	 *
	 * @param blockName
	 * @returns
	 */
	private makeBlockSelector( blockName: string ): string {
		return `div[aria-label="Block: ${ blockName }"]`;
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedFields: ExpectedField[] = [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email Field' ) },
			...this.configurationData.otherExpectedFields,
		];

		for ( const expectedField of expectedFields ) {
			const { type, accessibleName } = expectedField;
			await context.page.getByRole( type, { name: accessibleName } ).first().waitFor();
		}
	}
}
