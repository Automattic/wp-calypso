import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	// Both name lookup and restaurant ID lookup are supported.
	restaurant: number | string;
}

const blockParentSelector = 'div[aria-label="Block: OpenTable"]';
const selectors = {
	// Search
	searchInput: `${ blockParentSelector } input`,
	suggestion: ( name: string ) =>
		`${ blockParentSelector } .components-form-token-field__suggestion-match:has-text("${ name }")`,

	// Button
	embedButton: `${ blockParentSelector } button[type="submit"]`,
};

/**
 * Class representing the flow of using an OpenTable block in the editor
 */
export class OpenTableFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'OpenTable';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorFrame = await context.editorPage.getEditorFrame();
		const restaurant = this.configurationData.restaurant.toString();
		const searchLocator = editorFrame.locator( selectors.searchInput );
		await searchLocator.fill( restaurant );

		const suggestionLocator = editorFrame.locator( selectors.suggestion( restaurant ) ).first(); // There are many restaurants out there, let's grab the first if the name wasn't specific enough.
		await suggestionLocator.click();

		const embedButtonLocator = editorFrame.locator( selectors.embedButton );
		await embedButtonLocator.click();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedTextLocator = await context.page
			.frameLocator(
				`iframe[title="Online Reservations | OpenTable, ${ this.configurationData.restaurant.toString() }"]`
			)
			.locator( ':text("Make a Reservation")' );
		await expectedTextLocator.waitFor();
	}
}
