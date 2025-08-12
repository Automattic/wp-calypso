import { BlockFlow, EditorContext, PublishedPostContext } from '.';

type DonationFrequency = 'One-Time' | 'Monthly' | 'Yearly';

interface ConfigurationData {
	frequency?: DonationFrequency;
	currency: string;
}

interface ValidationData {
	frequency: DonationFrequency;
	customAmount: number;
	predefinedAmount: number;
}

const blockParentSelector = 'div[aria-label="Block: Donations Form"]';

const blockInsertedPopupConfirmButtonSelector =
	'div.jetpack-donations-first-time-modal[role="dialog"] button:has-text("Got it")';

/**
 * Represents the flow of using the Donations Form block.
 */
export class DonationsFormFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private validationData: ValidationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData, validationData: ValidationData ) {
		this.configurationData = configurationData;
		this.validationData = validationData;
	}

	blockSidebarName = 'Donations Form';
	blockEditorSelector = blockParentSelector;
	blockInsertedPopupConfirmButtonSelector = blockInsertedPopupConfirmButtonSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const block = editorCanvas.getByRole( 'document', { name: 'Block: Donations Form' } );

		if ( this.configurationData.currency ) {
			await context.editorPage.clickBlockToolbarButton( { name: 'Change currency' } );
			await context.editorPage.selectFromToolbarPopover(
				this.configurationData.currency.toUpperCase()
			);
		}

		if ( this.configurationData.frequency ) {
			await block.getByRole( 'button', { name: this.configurationData.frequency } ).click();
		}
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Another frequency can be selectd.
		await context.page
			.getByRole( 'main' )
			.getByRole( 'button', { name: this.validationData.frequency } )
			.click();

		// Custom donation amount can be entered.
		await context.page
			.getByRole( 'main' )
			.locator( '.donations__amount-value' )
			.fill( this.validationData.customAmount.toString() );
		await context.page
			.getByRole( 'main' )
			.getByRole( 'heading', { name: this.validationData.frequency } )
			.waitFor();

		// Select one of the tiers.
		await context.page
			.getByRole( 'main' )
			.locator( `[data-amount="${ this.validationData.predefinedAmount }"]:visible` )
			.click();

		// Click on donate.
		await context.page
			.getByRole( 'main' )
			.getByRole( 'link', { name: /Donate/, disabled: false } )
			.click();

		// Verify the donation popup.
		// For sites with plans Premium or lower, the block cannot be used and so the popup modal
		// states as such.
		// For sites where sales are allowed, ther are two variants in how this flow can behave:
		// 	1. on normal, user-controlled browsers, a Stripe-powered overlay appears.
		// 	2. on Playwright-controlled browsers, the page navigates to show a similar
		//     Stripe-powered overlay as 1.
		// Since this is used for automated E2E testing, we're disregarding and not checking for
		// variant 1.
		await Promise.race( [
			context.page.getByRole( 'button', { name: /pay now/i } ).waitFor(),
			context.page
				.frameLocator( 'iframe[id=TB_iframeContent]' )
				.getByRole( 'heading', { name: 'Sales disabled' } ),
		] );

		// Close the modal and return to the post.
		await context.page.keyboard.press( 'Escape' );
	}
}
