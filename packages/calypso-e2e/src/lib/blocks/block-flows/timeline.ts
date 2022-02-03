import { BlockFlow, EditorContext, PublishedPostContext } from '..';

// Because these are simple, pre-configured smoke test flows, there's no need to make this an array and dynamically add any number of entries.
// Let's favor simplicity!
interface ConfigurationData {
	firstEntry: string;
	secondEntry: string;
}

interface EntryDetails {
	nthIndex: number;
	entryText: string;
}

const blockParentSelector = '[aria-label="Block: Timeline"]';
const selectors = {
	entry: ( nthIndex: number ) => `[aria-label="Block: Timeline Entry"]:nth-child(${ nthIndex })`,
	entryParagraph: ( nthIndex: number ) =>
		`[aria-label="Block: Timeline Entry"]:nth-child(${ nthIndex }) [data-title=Paragraph]`,
	addEntryButton: `${ blockParentSelector } button:has-text("Add entry")`,
};

/**
 * Class representing the flow of using a Timeline block in the editor
 */
export class TimelineBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Timeline';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		await this.enterTextInEntry( context, {
			nthIndex: 1,
			entryText: this.configurationData.firstEntry,
		} );
		await context.editorIframe.click( selectors.addEntryButton );
		await this.enterTextInEntry( context, {
			nthIndex: 2,
			entryText: this.configurationData.secondEntry,
		} );
	}

	/**
	 * Enters text into a Timeline block entry.
	 *
	 * @param context Editor context.
	 * @param entryDetails The details (nth index and text) for the entry.
	 */
	private async enterTextInEntry(
		context: EditorContext,
		entryDetails: EntryDetails
	): Promise< void > {
		// In the mobile case, you have to first click on the entry itself, and THEN on the paragraph block.
		// Otherwise, it will just eat the first click!
		// This extra click works for both desktop and mobile.
		await context.editorIframe.click( selectors.entry( entryDetails.nthIndex ) );
		await context.editorIframe.click( selectors.entryParagraph( entryDetails.nthIndex ) );
		// 'fill' doesn't work on div or paragraph elements, have to use the more primitive 'type' method.
		await context.editorIframe.type(
			selectors.entryParagraph( entryDetails.nthIndex ),
			entryDetails.entryText
		);
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.waitForSelector( `text=${ this.configurationData.firstEntry }` );
		await context.page.waitForSelector( `text=${ this.configurationData.secondEntry }` );
	}
}
