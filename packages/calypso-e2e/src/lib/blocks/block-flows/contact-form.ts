import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	nameLabel: string;
}

const blockParentSelector = 'div[aria-label="Block: Form"]';
const selectors = {
	// Editor
	nameLabel: `${ blockParentSelector } label[role="textbox"]:text("Name")`,

	// Published
	publishedBlock: '.wp-block-jetpack-contact-form',
};

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
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		await context.editorIframe.click( selectors.nameLabel );
		await context.editorIframe.fill( selectors.nameLabel, '' );
		// It turns out that for editable labels other methods of filling text doesn't work.
		await context.page.keyboard.insertText( this.configurationData.nameLabel );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.waitForSelector( selectors.publishedBlock );
		await context.page.waitForSelector(
			`${ selectors.publishedBlock } :text("${ this.configurationData.nameLabel }")`
		);
	}
}
