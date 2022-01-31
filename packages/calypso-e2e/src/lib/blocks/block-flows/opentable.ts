import { Frame } from 'playwright';
import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	// Both name lookup and restaurant ID lookup are supported.
	restaurant: number | string;
}

const blockParentSelector = 'div[aria-label="Block: OpenTable"]';
const selectors = {
	// Search
	searchInput: `${ blockParentSelector } input`,
	suggestion: ( name: string ) => `${ blockParentSelector } strong:has-text("${ name }")`,

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
		const restaurant = this.configurationData.restaurant.toString();
		await context.editorIframe.fill( selectors.searchInput, restaurant );
		await context.editorIframe.click( selectors.suggestion( restaurant ) );
		await context.editorIframe.click( selectors.embedButton );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const frameHandle = await context.page.waitForSelector(
			`iframe[title="Online Reservations | OpenTable, ${ this.configurationData.restaurant.toString() }"]`
		);
		const frame = ( await frameHandle.contentFrame() ) as Frame;
		await frame.waitForSelector( `:text("Make a Reservation")` );
		await frame.waitForSelector( 'div[aria-label="Powered By OpenTable"]' );
	}
}
