import { OpenInlineInserter } from '../../pages';
import {
	labelFormFieldBlock,
	makeSelectorFromBlockName,
	validatePublishedFormFields,
} from './shared';
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
	blockSidebarName = 'Text input field';
	// ... but a full Form block is added and marked as selected in the editor!
	blockEditorSelector = makeSelectorFromBlockName( 'Form' );

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// Determine if we are working with the refactored form fields (released June 2025)
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const initailBlock = editorCanvas.locator( makeSelectorFromBlockName( 'Text input field' ) );
		const inputChild = initailBlock.locator( '[aria-label="Block: Input"]' );
		const isRefactor = ( await inputChild.count() ) > 0;

		// Text Input Field is already added by the first step, so let's start by labeling it.
		await labelFormFieldBlock( context.addedBlockLocator, {
			blockName: 'Text input field',
			accessibleLabelName: 'Add label…',
			labelText: this.addLabelPrefix( 'Text input field' ),
		} );
		let lastBlockName = 'Text input field';

		// Add remaining field blocks, labeling as we go.
		const remainingBlocksToAdd = [
			[ 'Name field', 'Add label…' ],
			[ 'Email field', 'Add label…' ],
			[ 'Website field', 'Add label…' ],
			[ 'Date picker', 'Add label…' ],
			[ 'Phone number field', 'Add label…' ],
			[ 'Multi-line text field', 'Add label…' ],
			[ 'Checkbox', 'Add label…' ],
			[ 'Multiple choice (checkbox)', 'Add label' ],
			[ 'Single choice (radio)', 'Add label' ],
			[ 'Dropdown field', 'Add label' ],
			[ 'Terms consent', 'Add implicit consent message…' ],
		];
		for ( const [ blockName, accessibleLabelName ] of remainingBlocksToAdd ) {
			await this.addFieldBlockToForm( context, blockName, lastBlockName, isRefactor );
			await labelFormFieldBlock( context.addedBlockLocator, {
				blockName,
				accessibleLabelName,
				labelText: this.addLabelPrefix( blockName ),
				isRefactor,
			} );
			lastBlockName = blockName;
		}

		// And we just wrap up labeling the auto-added blocks.
		const otherBlocksToLabel = isRefactor
			? [
					[ 'Button', 'Add text…' ],
					[ 'Option', 'Add option…', 'Single choice (radio)' ],
					[ 'Option', 'Add option…', 'Multiple choice (checkbox)' ],
			  ]
			: [
					[ 'Button', 'Add text…' ],
					[ 'Single Choice Option', 'Add option…' ],
					[ 'Multiple Choice Option', 'Add option…' ],
			  ];

		for ( const [ blockName, accessibleLabelName, parentBlockName ] of otherBlocksToLabel ) {
			await labelFormFieldBlock( context.addedBlockLocator, {
				blockName,
				accessibleLabelName,
				labelText: this.addLabelPrefix( blockName ),
				parentBlockName,
				isRefactor,
			} );
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const isRefactor = ( await context.page.locator( '.wp-block-jetpack-input' ).count() ) > 0;
		const radioName = isRefactor ? 'Option' : 'Single choice option';
		const checkboxName = isRefactor ? 'Option' : 'Multiple choice option';

		await validatePublishedFormFields( context.page, [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Text input field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Website field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Phone number field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Multi-line text field' ) },
			{ type: 'checkbox', accessibleName: this.addLabelPrefix( 'Checkbox' ) },
			{ type: 'radio', accessibleName: this.addLabelPrefix( radioName ) },
			{ type: 'checkbox', accessibleName: this.addLabelPrefix( checkboxName ) },
			{ type: 'button', accessibleName: this.addLabelPrefix( 'Button' ) },
			// Currently broken, sadly! See: https://github.com/Automattic/jetpack/issues/30762
			// { type: 'combobox', accessibleName: this.addLabelPrefix( 'Dropdown field' ) },
		] );

		// The terms consent is kind of weird because it's applied to a hidden checkbox, so we validate that here.
		await context.page
			.getByRole( 'checkbox', {
				name: this.addLabelPrefix( 'Terms consent' ),
				includeHidden: true,
			} )
			.first()
			.waitFor( { state: 'hidden' } );
	}

	/**
	 * A helper to for adding the configuration prefix to any given label name.
	 *
	 * @param {string} label The label to prefix.
	 * @returns A string with the prefix from the config data applied.
	 */
	private addLabelPrefix( label: string ): string {
		return `${ this.configurationData.labelPrefix } ${ label }`;
	}

	/**
	 * Adds a field block to the form using the inline inserter.
	 *
	 * @param {EditorContext} context The editor context object.
	 * @param {string} blockName Name of the block.
	 * @param {string} lastBlockName The name of the previously inserted block.
	 * @param {boolean} isRefactor Whether the block is part of the refactored form fields.
	 */
	private async addFieldBlockToForm(
		context: EditorContext,
		blockName: string,
		lastBlockName: string,
		isRefactor: boolean
	) {
		const openInlineInserter: OpenInlineInserter = async ( editorCanvas ) => {
			if ( isRefactor ) {
				await context.editorPage.selectParentBlock( lastBlockName );
				await context.editorPage.selectParentBlock( 'Form' );
			} else {
				await context.editorPage.selectParentBlock( 'Form' );
			}

			await editorCanvas.getByRole( 'button', { name: 'Add block' } ).click();
		};
		await context.editorPage.addBlockInline(
			blockName,
			makeSelectorFromBlockName( blockName ),
			openInlineInserter
		);
	}
}
