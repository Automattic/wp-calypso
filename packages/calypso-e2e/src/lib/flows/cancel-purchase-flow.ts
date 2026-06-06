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
 * Returns a locator that matches the cancellation survey's primary step button.
 *
 * The button's label depends on the survey step and the active intent/variant:
 * - Legacy / `intent=cancel`: non-final step renders "Continue", final step
 *   renders "Submit" (legacy) or "Complete" (split cancel/remove).
 * - `intent=remove` (the refund-and-remove path this flow now drives): non-final
 *   step renders "Continue removal", final step renders "Complete removal".
 *
 * Matching all of these keeps the flow robust regardless of which variant is
 * served. `exact: true` ensures "Continue" does not also resolve "Continue
 * removal" (and vice versa).
 *
 * The locator is scoped to the survey's `.cancel-purchase-form` container. The
 * survey renders as an overlay on top of the cancellation confirmation screen,
 * whose own primary button can share a label (e.g. "Continue removal"); scoping
 * avoids matching that underlying button and tripping strict-mode violations.
 *
 * @param {Page} page Page object the survey is rendered on.
 * @returns {Locator} Locator matching the survey's primary step button.
 */
function surveyStepButton( page: Page ): Locator {
	const surveyForm = page.locator( '.cancel-purchase-form' );
	return surveyForm
		.getByRole( 'button', { name: 'Submit', exact: true } )
		.or( surveyForm.getByRole( 'button', { name: 'Continue', exact: true } ) )
		.or( surveyForm.getByRole( 'button', { name: 'Complete', exact: true } ) )
		.or( surveyForm.getByRole( 'button', { name: 'Continue removal', exact: true } ) )
		.or( surveyForm.getByRole( 'button', { name: 'Complete removal', exact: true } ) );
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
	// The feedback question is worded by intent: "Why would you like to cancel?"
	// on the cancel path and "Why would you like to remove?" on the refund-and-
	// remove (`intent=remove`) path this flow now drives. Match either.
	await page
		.getByRole( 'combobox', { name: /Why would you like to (cancel|remove)\?/ } )
		.selectOption( feedback.reason );

	await page
		.getByRole( 'textbox', { name: 'Can you please specify?' } )
		.fill( feedback.customReasonText );

	// Submit the feedback step. This is not the final step, so under the
	// refund-and-remove (`intent=remove`) path the button is labelled "Continue
	// removal"; other variants label it "Continue". `surveyStepButton` matches
	// whichever renders.
	await clickWhenEnabled( surveyStepButton( page ) );

	// The next (and final) step asks where the user is headed next. Selecting an
	// answer enables the final step button.
	await page
		.getByRole( 'combobox', { name: 'Where is your next adventure taking you?' } )
		.selectOption( "I'm staying here and using the free plan." );

	// Submitting the final step fires the cancel-and-refund request. Start
	// listening for its response *before* clicking so the listener cannot miss
	// a fast response. The request hits `wpcom/v2/purchases/<id>/cancel`; the
	// API proxy URL contains `purchases/<id>/cancel`.
	const cancelResponsePromise = page.waitForResponse(
		( response ) => /\/purchases\/\d+\/cancel/.test( response.url() ),
		// A refund is a real server round-trip and can be slow in the test
		// environment, so allow a generous window.
		{ timeout: 60 * 1000 }
	);

	// Submit the final step. The survey for a plan cancellation only has these
	// two steps, so there is no third button to click. The final button renders
	// visible but `disabled`/`is-busy` while the cancellation request is in
	// flight, so visibility alone is not enough to click it reliably — wait for
	// it to become enabled first.
	await clickWhenEnabled( surveyStepButton( page ) );

	// Confirming the cancellation does not trigger a full-page navigation: the
	// purchases view updates in place as a single-page-app state change. The
	// previous `page.waitForNavigation()` therefore never resolved and hung
	// until its timeout.
	//
	// Clicking the final button only *fires* the survey's `onSurveyComplete`
	// handler, which then `await`s the cancel-and-refund API request before
	// rendering the success notice. Returning right after the click left the
	// caller's `noticeShown()` assertion racing the entire refund round-trip:
	// the success notice is created with a 10s auto-dismiss `duration`, so a
	// slow refund could push the notice's brief visible window outside the
	// assertion's budget. Block here until the cancel request actually
	// resolves so the caller's notice assertion only has to cover the notice
	// render, not the full network round-trip.
	await cancelResponsePromise;
}
