import { Page } from 'playwright';

type CancelReason = 'Another reason…';

/**
 * Cancels a purchased subscription.
 */
export async function cancelSubscriptionFlow( page: Page ) {
	await page.getByRole( 'button', { name: 'Submit' } ).click();
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

	// Wait for the final button to be present and actionable before clicking.
	// `click()` auto-waits for visibility and the enabled state, so an explicit
	// `waitForFunction` on the disabled attribute is no longer needed.
	await finalButton.waitFor( { state: 'visible' } );
	await finalButton.click();

	// Confirming the cancellation does not trigger a full-page navigation: the
	// purchases view updates in place as a single-page-app state change. The
	// previous `page.waitForNavigation()` therefore never resolved and hung
	// until its timeout. Callers assert the resulting success notice (e.g.
	// "Your refund has been processed and your purchase removed.") to confirm
	// the flow completed, which is the deterministic signal to wait on.
}
