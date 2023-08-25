import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	labelPrefix: string;
}

/**
 * Class representing the flow of using an block in the editor.
 */
export class ContactFormFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Contact Form';
	blockEditorSelector = 'div[aria-label="Block: Form"]';

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// Name and Email are common fields shared amongst most Form patterns.
		// So let's make them unique here!
		await this.labelFieldBlock( context, 'Name Field' );
		await this.labelFieldBlock( context, 'Email Field' );
	}

	/** */
	private async labelFieldBlock( context: EditorContext, blockName: string ) {
		const parentFormBlock = context.addedBlockLocator;
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
		interface ExpectedField {
			type: 'textbox' | 'checkbox' | 'radio' | 'combobox' | 'button';
			accessibleName: string;
		}

		const expectedFields: ExpectedField[] = [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email Field' ) },
			// This is the default label pulled in by the Contact Form pattern.
			// It's unique-ish and a good validation of that pattern, so we've left it alone.
			{ type: 'textbox', accessibleName: 'Message' },
			// Same with the default text on the submit button.
			{ type: 'button', accessibleName: 'Contact Us' },
		];

		for ( const expectedField of expectedFields ) {
			const { type, accessibleName } = expectedField;
			await context.page.getByRole( type, { name: accessibleName } ).first().waitFor();
		}
	}
}
