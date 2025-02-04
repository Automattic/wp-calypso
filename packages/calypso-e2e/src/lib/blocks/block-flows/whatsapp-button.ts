import { Locator } from 'playwright';
import { EditorComponent, EditorSettingsSidebarComponent } from '../../..';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	phoneNumber: number | string;
	buttonText?: string;
}

const selectors = {
	// Editor
	phoneNumberInput: 'input[placeholder="Your phone number…"]',
	buttonLabel: 'a.whatsapp-block__button',
	editorSettingsButton:
		'.editor-header__settings button[aria-label="Settings"], .edit-post-header__settings button[aria-label="Settings"]',

	// Published
	// 'main' needs to be specified due to the debug elements
	block: 'main div.wp-block-jetpack-whatsapp-button',
};

/**
 * Class representing the flow of using an block in the editor.
 */
export class WhatsAppButtonFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	blockEditorSelector: string;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
		this.blockEditorSelector = 'div[aria-label="Block: WhatsApp Button"]';
	}

	blockSidebarName = 'WhatsApp Button';

	/**
	 * Given a Locator, determines whether the target button/toggle is
	 * in an expanded state.
	 *
	 * If the toggle is in the on state or otherwise in an expanded
	 * state, this method will return true. Otherwise, false.
	 *
	 * @param {Locator} target Target button.
	 * @returns {Promise<boolean>} True if target is in an expanded state. False otherwise.
	 */
	private async targetIsOpen( target: Locator ): Promise< boolean > {
		const pressed = await target.getAttribute( 'aria-pressed' );
		const expanded = await target.getAttribute( 'aria-expanded' );
		return pressed === 'true' || expanded === 'true';
	}

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		// Update the button text if config data is present.
		if ( this.configurationData.buttonText ) {
			const buttonLabelLocator = editorCanvas.locator( selectors.buttonLabel );
			// First clear the text.
			await buttonLabelLocator.fill( '' );
			await buttonLabelLocator.fill( this.configurationData.buttonText );
		}

		const editorParent = await context.editorPage.getEditorParent();

		const editorSettingsButton = editorParent.locator( selectors.editorSettingsButton );

		// This is especially needed in mobile viewport where the settings panel takes up the screen
		// and needs to be open deliberately
		if ( ! ( await this.targetIsOpen( editorSettingsButton ) ) ) {
			await editorSettingsButton.click();
		}

		// We select the button by text content because `.getByRole('button')` has the potential to select multiple
		// elements here. WhatsApp block also has a similarly themed settings button
		const whatsAppSettingsButton = editorParent.locator(
			'button >> text="WhatsApp Button Settings"'
		);

		// Open the block settings dialog.
		// Check if the settings dialog is already open, otherwise clicking closes it, as the button works as a toggle
		if ( ! ( await this.targetIsOpen( whatsAppSettingsButton ) ) ) {
			await whatsAppSettingsButton.click();
		}

		// Enter phone number.
		const phoneInputLocator = editorParent.locator( selectors.phoneNumberInput );
		await phoneInputLocator.fill( this.configurationData.phoneNumber.toString() );

		// Dismiss the block settings dialog.
		await whatsAppSettingsButton.click();

		await phoneInputLocator.waitFor( { state: 'detached' } );

		const editorSettingsSidebarComponent = new EditorSettingsSidebarComponent(
			context.page,
			new EditorComponent( context.page )
		);
		await editorSettingsSidebarComponent.closeSidebarForMobile();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const blockLocator = context.page.locator( selectors.block );
		await blockLocator.waitFor();

		if ( this.configurationData.buttonText ) {
			const expectedButtonTextLocator = context.page.locator(
				`${ selectors.block } :text("${ this.configurationData.buttonText }")`
			);
			await expectedButtonTextLocator.waitFor();
		}
	}
}
