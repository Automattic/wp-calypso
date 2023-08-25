import { envVariables } from '../../..';
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
	blockSidebarName = 'Text Input Field';
	// ... but a full Form block is added and marked as selected in the editor!
	blockEditorSelector = makeSelectorFromBlockName( 'Form' );

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// Text Input Field is already added by the first step, so let's start by labeling it.
		await labelFormFieldBlock( context.addedBlockLocator, {
			blockName: 'Text Input Field',
			accessibleLabelName: 'Add label…',
			labelText: this.addLabelPrefix( 'Text Input Field' ),
		} );

		// Add remaining field blocks, labeling as we go.
		const remainingBlocksToAdd = [
			[ 'Name Field', 'Add label…' ],
			[ 'Email Field', 'Add label…' ],
			[ 'URL Field', 'Add label…' ],
			[ 'Date Picker', 'Add label…' ],
			[ 'Phone Number Field', 'Add label…' ],
			[ 'Multi-line Text Field', 'Add label…' ],
			[ 'Checkbox', 'Add label…' ],
			[ 'Multiple Choice (Checkbox)', 'Add label' ],
			[ 'Single Choice (Radio)', 'Add label' ],
			[ 'Dropdown Field', 'Add label' ],
			[ 'Terms Consent', 'Add implicit consent message…' ],
		];
		for ( const [ blockName, accessibleLabelName ] of remainingBlocksToAdd ) {
			await this.addFieldBlockToForm( context, blockName );
			await labelFormFieldBlock( context.addedBlockLocator, {
				blockName,
				accessibleLabelName,
				labelText: this.addLabelPrefix( blockName ),
			} );
		}

		// And we just wrap up labeling the auto-added blocks.
		const otherBlocksToLabel = [
			[ 'Button', 'Add text…' ],
			[ 'Single Choice Option', 'Add option…' ],
			[ 'Multiple Choice Option', 'Add option…' ],
		];
		for ( const [ blockName, accessibleLabelName ] of otherBlocksToLabel ) {
			await labelFormFieldBlock( context.addedBlockLocator, {
				blockName,
				accessibleLabelName,
				labelText: this.addLabelPrefix( blockName ),
			} );
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await validatePublishedFormFields( context.page, [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Text Input Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'URL Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Phone Number Field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Multi-line Text Field' ) },
			{ type: 'checkbox', accessibleName: this.addLabelPrefix( 'Checkbox' ) },
			{ type: 'radio', accessibleName: this.addLabelPrefix( 'Single Choice Option' ) },
			{ type: 'checkbox', accessibleName: this.addLabelPrefix( 'Multiple Choice Option' ) },
			{ type: 'button', accessibleName: this.addLabelPrefix( 'Button' ) },
			// Currently broken, sadly! See: https://github.com/Automattic/jetpack/issues/30762
			// { type: 'combobox', accessibleName: this.addLabelPrefix( 'Dropdown Field' ) },
		] );

		// The terms consent is kind of weird because it's applied to a hidden checkbox, so we validate that here.
		await context.page
			.getByRole( 'checkbox', {
				name: this.addLabelPrefix( 'Terms Consent' ),
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
	 */
	private async addFieldBlockToForm( context: EditorContext, blockName: string ) {
		const openInlineInserter: OpenInlineInserter = async ( editorCanvas ) => {
			await context.editorPage.selectBlockParent( 'Form' );
			const addBlockLocater = await editorCanvas.getByRole( 'button', { name: 'Add block' } );
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				// See: https://github.com/Automattic/jetpack/issues/32695
				// On mobile, we can't click the inline button directly due to an overlay z-index bug.
				// So we force the click via dispatchEvent.
				await addBlockLocater.waitFor();
				await addBlockLocater.dispatchEvent( 'click' );
			} else {
				await addBlockLocater.click();
			}
		};
		await context.editorPage.addBlockInline(
			blockName,
			makeSelectorFromBlockName( blockName ),
			openInlineInserter
		);
	}
}
