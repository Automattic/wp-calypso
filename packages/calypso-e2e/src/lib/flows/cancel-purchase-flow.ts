import { Page } from 'playwright';

type CancelReason = 'Another reason…';

/**
 * Cancels a purchased subscription.
 */
export async function cancelSubscriptionFlow( page: Page ) {
	await page.getByRole( 'button', { name: 'Submit' } ).click();
}

/**
 * Cancels a purchased plan.
 */
export async function cancelPurchaseFlow(
	page: Page,
	feedback: {
		reason: CancelReason;
		customReasonText: string;
	}
) {
	await page
		.getByRole( 'combobox', { name: 'Why would you like to cancel?' } )
		.selectOption( feedback.reason );

	await page
		.getByRole( 'textbox', { name: 'Can you please specify?' } )
		.fill( feedback.customReasonText );

	await page.getByRole( 'button', { name: 'Submit' } ).click();

	await Promise.all( [
		page.waitForNavigation( { timeout: 30 * 1000 } ),
		page.getByRole( 'button', { name: 'Submit' } ).click(),
	] );
}

/**
 * Cancels a purchased Atomic site.
 */
export async function cancelAtomicPurchaseFlow(
	page: Page,
	feedback: {
		reason: CancelReason;
		customReasonText: string;
	}
) {
	await page
		.getByRole( 'combobox', { name: 'Why would you like to cancel?' } )
		.selectOption( feedback.reason );

	await page
		.getByRole( 'textbox', { name: 'Can you please specify?' } )
		.fill( feedback.customReasonText );

	// Submit first step - could be "Submit" or "Continue"
	const firstButton = page
		.getByRole( 'button', { name: 'Submit' } )
		.or( page.getByRole( 'button', { name: 'Continue' } ) );
	await firstButton.waitFor( { state: 'visible' } );
	await firstButton.click();

	// Select dropdown value to enable the next button
	await page
		.getByRole( 'combobox', { name: 'Where is your next adventure taking you?' } )
		.selectOption( "I'm staying here and using the free plan." );

	// Submit second step - could be "Submit" or "Continue"
	const secondButton = page
		.getByRole( 'button', { name: 'Submit' } )
		.or( page.getByRole( 'button', { name: 'Continue' } ) );
	await secondButton.waitFor( { state: 'visible' } );
	await secondButton.click();

	const finalButton = page
		.getByRole( 'button', { name: 'Submit' } )
		.or( page.getByRole( 'button', { name: 'Continue' } ) );

	await Promise.all( [
		page.waitForNavigation( { timeout: 30 * 1000 } ),
		finalButton.waitFor( { state: 'visible' } ),
		// Wait for button to be enabled
		page.waitForFunction(
			() => {
				const button = document.querySelector( 'button[class*="is-primary"]' );
				return button && ! button.hasAttribute( 'disabled' );
			},
			{ timeout: 10000 }
		),
	] );
}
