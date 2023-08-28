import { BlockFlow, EditorContext, PublishedPostContext } from '.';

type AdBlockFormat = 'Rectangle' | 'Leaderboard' | 'Mobile Leaderboard' | 'Wide Skyscraper';

interface ConfigurationData {
	format?: AdBlockFormat;
}

const blockParentSelector = 'div[aria-label="Block: Ad"]';

/**
 * Represents the flow of using an Ad block.
 */
export class AdFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block.
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Ad';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// Nothing to configure on this block aside from the ad block size.
		// Note, block smoke E2E tests do not call this codepath due to a mismatch in the
		// accessible role of the menu items.
		// @see: https://github.com/Automattic/jetpack/issues/32703
		if ( this.configurationData.format ) {
			await context.editorPage.clickBlockToolbarButton( { name: 'Pick an ad format' } );
			await context.editorPage.selectFromToolbarPopover( this.configurationData.format );
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// There should be a span with the text 'Advertisements' in place of the block.
		await context.page.locator( '.wpa-about' ).filter( { hasText: 'Advertisements' } ).waitFor();
	}
}
