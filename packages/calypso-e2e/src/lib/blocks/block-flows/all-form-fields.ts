import { OpenInlineInserter } from '../../pages';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	labelPrefix: string;
}

/**
 * Class representing the flow of using an block in the editor.
 */
export class AllFormFieldsFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	// You add an individual input field...
	blockSidebarName = 'Text Input Field';
	// ... but a full Form block is added and marked as selected in the editor!
	blockEditorSelector = "[aria-label='Block: Form']";

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// The first block, the "Text Input Field", gets added by the shared block flow code.
		// We need to label it though still.
		await this.labelFieldBlock( context, 'Text Input Field' );

		// Next, we need to add an label all the other fields!
		const blockNames = [
			'Name Field',
			'Email Field',
			'URL Field',
			'Date Picker',
			'Phone Number Field',
			'Multi-line Text Field',
			'Checkbox',
			'Multiple Choice (Checkbox)',
			'Single Choice (Radio)',
			'Dropdown Field',
		];
		for ( const blockName of blockNames ) {
			await this.addFieldBlockToForm( context, blockName );
			await this.labelFieldBlock( context, blockName );
		}

		// Finally we add the Terms Consent block. It's a unique case in that its "label" is really its full text
		// and looks different in the DOM.
		await this.addFieldBlockToForm( context, 'Terms Consent' );

		// Now, we just need to add any final configuration pieces!
		await this.configureSingleChoiceOption( context );
		await this.configureMultipleChoiceOption( context );
		await this.configureTermsConsent( context );
		await this.configureSubmitButton( context );
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
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Text Input Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'URL Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Phone Number Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Multi-line Text Field' ) },
			{ type: 'checkbox', accessibleName: this.addLabelPrefix( 'Checkbox' ) },
			{ type: 'radio', accessibleName: this.addLabelPrefix( 'Single Option' ) },
			{ type: 'checkbox', accessibleName: this.addLabelPrefix( 'Multiple Option' ) },
			// Currently broken, sadly! See: https://github.com/Automattic/jetpack/issues/30762
			// { type: 'combobox', accessibleName: this.addLabelPrefix( 'Dropdown Field' ) },
			{ type: 'button', accessibleName: this.addLabelPrefix( 'Submit' ) },
		];

		for ( const expectedField of expectedFields ) {
			const { type, accessibleName } = expectedField;
			await context.page.getByRole( type, { name: accessibleName } ).first().waitFor();
		}

		// The terms consent is kind of weird because it's applied to a hidden checkbox.
		await context.page
			.getByRole( 'checkbox', {
				name: this.addLabelPrefix( 'Terms Consent Message' ),
				includeHidden: true,
			} )
			.first()
			.waitFor( { state: 'hidden' } );
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
	 *
	 * @param context
	 * @param blockName
	 */
	private async addFieldBlockToForm( context: EditorContext, blockName: string ) {
		const openInlineInserter: OpenInlineInserter = async ( editorCanvas ) => {
			await context.editorPage.selectBlockParent();
			await editorCanvas.getByRole( 'button', { name: 'Add block' } ).click();
		};
		await context.editorPage.addBlockInline(
			blockName,
			this.makeBlockSelector( blockName ),
			openInlineInserter
		);
	}

	/** */
	private async labelFieldBlock( context: EditorContext, blockName: string ) {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		await editorCanvas
			.locator( this.makeBlockSelector( blockName ) )
			.getByRole( 'textbox', { name: 'Add label…' } )
			.fill( this.addLabelPrefix( blockName ) );
	}

	/**
	 *
	 * @param context
	 */
	private async configureSingleChoiceOption( context: EditorContext ) {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		await editorCanvas
			.locator( this.makeBlockSelector( 'Single Choice (Radio)' ) )
			.getByRole( 'textbox', { name: 'Add option…' } )
			.fill( this.addLabelPrefix( 'Single Option' ) );
	}

	/**
	 *
	 * @param context
	 */
	private async configureMultipleChoiceOption( context: EditorContext ) {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		await editorCanvas
			.locator( this.makeBlockSelector( 'Multiple Choice (Checkbox)' ) )
			.getByRole( 'textbox', { name: 'Add option…' } )
			.fill( this.addLabelPrefix( 'Multiple Option' ) );
	}

	/**
	 *
	 * @param context
	 */
	private async configureTermsConsent( context: EditorContext ) {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		await editorCanvas
			.locator( this.makeBlockSelector( 'Terms Consent' ) )
			.getByRole( 'textbox', { name: 'Add implicit consent message…' } )
			.fill( this.addLabelPrefix( 'Terms Consent Message' ) );
	}

	/**
	 *
	 * @param context
	 */
	private async configureSubmitButton( context: EditorContext ) {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		await editorCanvas
			.locator( this.makeBlockSelector( 'Button' ) )
			.getByRole( 'textbox', { name: 'Add text…' } )
			.fill( `${ this.configurationData.labelPrefix } Submit` );
	}
}
