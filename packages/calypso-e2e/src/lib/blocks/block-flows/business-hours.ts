import { BlockFlow, EditorContext, PublishedPostContext } from '.';

type DaysOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface ConfigurationData {
	day: DaysOfWeek;
}

const blockParentSelector = 'div[aria-label="Block: Business Hours"]';
const selectors = {
	// Editor
	dayToggle: ( day: DaysOfWeek ) => `div.${ day } input`,
	dayMarkedAsOpen: ( day: DaysOfWeek ) => `div.${ day } .components-toggle-control :text("Open")`,

	// Published
	hoursForDay: ( day: DaysOfWeek ) => `div.jetpack-business-hours__item:has(dd.${ day })`,
};

/**
 * Class representing the flow of using an block in the editor.
 */
export class BusinessHoursFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Business Hours';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const day = this.configurationData.day;
		const dayToggleLocator = editorCanvas.locator( selectors.dayToggle( day ) );
		await dayToggleLocator.click();

		const dayMarkedAsOpenLocator = editorCanvas.locator( selectors.dayMarkedAsOpen( day ) );
		await dayMarkedAsOpenLocator.waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Note our use of U+2013 for hyphens. If your editor highlights this fact,
		// add a rule to ignore.
		const expectedSaturdayHoursLocator = context.page.locator(
			`${ selectors.hoursForDay( 'Sat' ) } :text("9:00 am – 5:00 pm")`
		);
		await expectedSaturdayHoursLocator.waitFor();
	}
}
