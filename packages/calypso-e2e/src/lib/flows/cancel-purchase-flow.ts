import { Locator, Page } from 'playwright';

type CancelReason = 'Another reason…';

/**
 * Clicks a button locator once it is both visible and actually enabled.
 *
 * The cancellation flow renders its primary buttons with the
 * `@wordpress/components` "busy" state (`class="is-busy"` plus the `disabled`
 * attribute) while an async request is in flight. Such a button is visible but
 * not actionable, so `click()` alone can exhaust its action timeout before the
 * button settles. Waiting for the `disabled` attribute to be removed first
 * guarantees the subsequent click targets an enabled element. The button may
 * also re-render between states; polling the live locator rides that out.
 *
 * @param {Locator} button Button locator to wait on and click.
 * @param {number} timeout Maximum time, in milliseconds, to wait for the enabled state.
 */
async function clickWhenEnabled( button: Locator, timeout = 30 * 1000 ): Promise< void > {
	const deadline = Date.now() + timeout;

	await button.waitFor( { state: 'visible', timeout } );

	while ( ( await button.getAttribute( 'disabled' ) ) !== null ) {
		if ( Date.now() >= deadline ) {
			throw new Error(
				`Timed out after ${ timeout }ms waiting for button to become enabled before clicking.`
			);
		}
		await button.page().waitForTimeout( 100 );
		await button.waitFor( { state: 'visible', timeout: Math.max( deadline - Date.now(), 1 ) } );
	}

	await button.click();
}

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
	await clickWhenEnabled( firstButton );

	// Select dropdown value to enable the next button
	await page
		.getByRole( 'combobox', { name: 'Where is your next adventure taking you?' } )
		.selectOption( "I'm staying here and using the free plan." );

	// Submit second step - could be "Submit" or "Continue"
	const secondButton = page
		.getByRole( 'button', { name: 'Submit' } )
		.or( page.getByRole( 'button', { name: 'Continue' } ) );
	await clickWhenEnabled( secondButton );

	const finalButton = page
		.getByRole( 'button', { name: 'Submit' } )
		.or( page.getByRole( 'button', { name: 'Continue' } ) );

	// The final button renders visible but `disabled`/`is-busy` while the
	// cancellation request is in flight, so visibility alone is not enough to
	// click it reliably. Wait for it to become enabled first.
	await clickWhenEnabled( finalButton );

	// Confirming the cancellation does not trigger a full-page navigation: the
	// purchases view updates in place as a single-page-app state change. The
	// previous `page.waitForNavigation()` therefore never resolved and hung
	// until its timeout. Callers assert the resulting success notice (e.g.
	// "Your refund has been processed and your purchase removed.") to confirm
	// the flow completed, which is the deterministic signal to wait on.
}
