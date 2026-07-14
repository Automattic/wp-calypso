import { Locator, Page } from 'playwright';

type CancelReason = 'Another reason…';

/**
 * Clicks a button locator once it is both visible and actually enabled.
 *
 * The cancellation survey renders its primary button with the
 * `@wordpress/components` "busy" state (`class="is-busy"` plus the `disabled`
 * attribute) while an async request is in flight, and keeps it disabled until
 * the current step's required answers are filled in. Such a button is visible
 * but not actionable, so `click()` alone can exhaust its action timeout before
 * the button settles. Waiting for the `disabled` attribute to be removed first
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
 * Returns a locator matching the cancellation survey's primary step button.
 *
 * Every step of the dashboard survey — including the last — advances with
 * "Continue". The "Complete" and "…removal" variants only render on the
 * intent-driven paths gated behind the `purchases/split-cancel-remove` feature
 * flag, which is off in every deployed environment.
 *
 * @param {Page} page Page object the survey is rendered on.
 * @returns {Locator} Locator matching the survey's primary step button.
 */
function surveyStepButton( page: Page ): Locator {
	return page.getByRole( 'button', { name: 'Continue', exact: true } );
}

/**
 * Waits for the cancel-and-refund request fired by the final survey step.
 *
 * The dashboard cancels through `wpcom/v2/upgrades/<id>/cancel` (the classic UI
 * used `purchases/<id>/cancel`). Callers must start listening *before* the click
 * that fires it, so a fast response cannot be missed.
 *
 * @param {Page} page Page object the survey is rendered on.
 * @returns {Promise} Promise resolving once the cancellation request resolves.
 */
function waitForCancelResponse( page: Page ) {
	return page.waitForResponse( ( response ) => /\/upgrades\/\d+\/cancel/.test( response.url() ), {
		// A refund is a real server round-trip and can be slow, so allow a
		// generous window.
		timeout: 60 * 1000,
	} );
}

/**
 * Completes the cancellation survey for a non-plan subscription (e.g. a storage
 * add-on).
 *
 * Such purchases get a single survey step whose only field — "What's one thing
 * we could have done better?" — is optional, so submitting it immediately fires
 * the cancel-and-refund request.
 */
export async function cancelSubscriptionFlow( page: Page ) {
	const cancelResponsePromise = waitForCancelResponse( page );

	await clickWhenEnabled( surveyStepButton( page ) );

	await cancelResponsePromise;
}

/**
 * Completes the cancellation survey for a plan.
 *
 * A plan gets two survey steps: a reason for cancelling, then where the user is
 * headed next. Both are required, and the step button stays disabled until they
 * are answered.
 */
export async function cancelAtomicPurchaseFlow(
	page: Page,
	feedback: {
		reason: CancelReason;
		customReasonText: string;
	}
) {
	// Choosing "Another reason…" reveals a free-text field and, unlike most of
	// the other reasons, routes past the upsell step straight to the next one.
	await page.getByRole( 'radio', { name: feedback.reason } ).check();
	await page
		.getByRole( 'textbox', { name: 'Can you please specify?' } )
		.fill( feedback.customReasonText );

	await clickWhenEnabled( surveyStepButton( page ) );

	// The next (and final) step asks where the user is headed next. Selecting an
	// answer enables the final step button.
	await page.getByRole( 'radio', { name: "I'm staying here and using the free plan." } ).check();

	// Submitting the final step fires the cancel-and-refund request. Listen for
	// its response before clicking so a fast response cannot be missed.
	const cancelResponsePromise = waitForCancelResponse( page );

	await clickWhenEnabled( surveyStepButton( page ) );

	// Submitting only *fires* the survey's completion handler, which then awaits
	// the cancel-and-refund request before showing the success snackbar and
	// navigating away. The snackbar auto-dismisses, so returning right after the
	// click would leave the caller's assertion racing the whole refund
	// round-trip. Block until the request actually resolves.
	await cancelResponsePromise;
}
