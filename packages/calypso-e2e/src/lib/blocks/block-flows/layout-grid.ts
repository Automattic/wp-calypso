import { Locator } from 'playwright';
import { BlockFlow, EditorContext, PublishedPostContext } from '..';
import { OpenInlineInserterDelegate } from '../../pages';

// As a layout block, there's pretty massive amounts of potential variability in configuration.
// To keep things simple and maintainable, I think it's best to just lock in a simple, singular case (two columns of text) for the smoke test.
interface ConfigurationData {
	leftColumnText: string;
	rightColumnText: string;
}

interface ColumnDetails {
	columnNumber: number;
	textToAdd: string;
}

const blockParentSelector = '[aria-label="Block: Layout Grid"]';
const selectors = {
	twoColumnButton: `${ blockParentSelector } button[aria-label="2 cols"]`,
	addBlockButton: ( column: number ) =>
		`${ blockParentSelector } [aria-label="Block: Column"]:nth-child(${ column }) button[aria-label="Add block"]`,
	paragraphBlock: ( column: number ) =>
		`${ blockParentSelector } [aria-label="Block: Column"]:nth-child(${ column }) [data-title=Paragraph]`,
};

/**
 * Class representing the flow of using a Layout Grid block in the editor.
 */
export class LayoutGridBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block.
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Layout Grid';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor.
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		const twoColumnButtonLocator = context.editorLocator.locator( selectors.twoColumnButton );
		await twoColumnButtonLocator.click();

		await this.addTextToColumn(
			{
				columnNumber: 1,
				textToAdd: this.configurationData.leftColumnText,
			},
			context
		);
		await this.addTextToColumn(
			{
				columnNumber: 2,
				textToAdd: this.configurationData.rightColumnText,
			},
			context
		);
	}

	/**
	 * Add text to a given column in a layout grid.
	 *
	 * @param {ColumnDetails} columnDetails Details for the column to be configured.
	 * @param {EditorContext} context The current context for the editor at the point of test execution.
	 */
	private async addTextToColumn(
		columnDetails: ColumnDetails,
		context: EditorContext
	): Promise< void > {
		const openInlineInserter: OpenInlineInserterDelegate = async ( editor: Locator ) => {
			const addBlockButtonLocator = editor.locator(
				selectors.addBlockButton( columnDetails.columnNumber )
			);
			// On mobile, a lot of clicks are eaten en route to the button. This doesn't play well with Playwright and can cause fragility.
			// A more stable, viewport-safe approach is to focus and press enter (which is also a real workflow for keyboard users).
			await addBlockButtonLocator.focus();
			await addBlockButtonLocator.press( 'Enter' );
		};

		await context.editorPage.addBlockInline(
			'Paragraph',
			selectors.paragraphBlock( columnDetails.columnNumber ),
			openInlineInserter
		);

		const addedParagraphLocator = context.editorLocator.locator(
			selectors.paragraphBlock( columnDetails.columnNumber )
		);
		await addedParagraphLocator.fill( columnDetails.textToAdd );
	}

	/**
	 * Validate the block in the published post.
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedLeftColumnTextLocator = context.page.locator(
			`text=${ this.configurationData.leftColumnText }`
		);
		await expectedLeftColumnTextLocator.waitFor();

		const expectedRightColumnTextLocator = context.page.locator(
			`text=${ this.configurationData.rightColumnText }`
		);
		await expectedRightColumnTextLocator.waitFor();
	}
}
