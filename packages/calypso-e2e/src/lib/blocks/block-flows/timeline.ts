import { BlockFlow, EditorContext, PublishedPostContext } from '.';

// Because these are simple, pre-configured smoke test flows, there's no need to make this an array and dynamically add any number of entries.
// Let's favor simplicity!
interface ConfigurationData {
	firstEntry: string;
	secondEntry: string;
}

const blockParentSelector = '[aria-label="Block: Timeline"]';
const selectors = {
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
		const editorCanvas = await context.editorPage.getEditorCanvas();

		const firstParagraphLocator = editorCanvas.locator( selectors.entryParagraph( 1 ) );
		await firstParagraphLocator.fill( this.configurationData.firstEntry );

		const addEntryButtonLocator = editorCanvas.locator( selectors.addEntryButton );
		await addEntryButtonLocator.click();

		const secondParagraphLocator = editorCanvas.locator( selectors.entryParagraph( 2 ) );
		await secondParagraphLocator.fill( this.configurationData.secondEntry );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedFirstTextLocator = context.page.locator(
			`main :text("${ this.configurationData.firstEntry }")` // 'main' needs to be specified due to the debug elements
		);
		await expectedFirstTextLocator.waitFor();

		const expectedSecondTextLocator = context.page.locator(
			`main :text("${ this.configurationData.secondEntry }")` // 'main' needs to be specified due to the debug elements
		);
		await expectedSecondTextLocator.waitFor();
	}
}
