import { Page } from 'playwright';

type CancelReason = 'Another reason…';

// The survey's step buttons render `@wordpress/components` buttons that are
// `disabled`/`is-busy` while a request is in flight. Playwright's actionability
// checks ride that out, but the default action timeout is too tight for a real
// cancel-and-refund round-trip in the test environment.
const STEP_BUTTON_TIMEOUT = 30 * 1000;

/**
 * Returns a promise for the cancel-and-refund response fired when a Multi-site
 * Dashboard removal survey is completed.
 *
 * Both the plan and the non-plan (add-on) surveys hit `POST
 * wpcom/v2/upgrades/<id>/cancel`; the API proxy URL contains
 * `upgrades/<id>/cancel`. Start listening *before* clicking the final button so
 * the listener cannot miss a fast response, then block on it so the caller's
 * snackbar assertion only has to catch the notice render (it auto-dismisses).
 *
 * @param page Page the survey is rendered on.
 */
function waitForUpgradeCancel( page: Page ) {
	return page.waitForResponse(
		( response ) =>
			response.request().method() === 'POST' && /\/upgrades\/\d+\/cancel/.test( response.url() ),
		// A refund is a real server round-trip and can be slow in the test
		// environment, so allow a generous window.
		{ timeout: 60 * 1000 }
	);
}

/**
 * Completes the Multi-site Dashboard cancellation confirmation and survey for a
 * plan being removed with a refund.
 *
 * The survey copy is shared with the classic dashboard, but its markup is not:
 * the questions render as `RadioControl` groups rather than dropdowns, and the
 * step buttons are labelled by intent ("Continue removal" / "Complete removal"
 * on the `intent=remove` path this flow drives). `cancelAtomicPurchaseFlow`
 * covers the classic equivalent.
 *
 * @param page Page the survey is rendered on.
 * @param feedback Answers to give to the survey.
 * @param feedback.reason Cancellation reason to select.
 * @param feedback.customReasonText Free-text elaboration on the reason.
 */
export async function cancelDashboardPurchaseFlow(
	page: Page,
	feedback: {
		reason: CancelReason;
		customReasonText: string;
	}
) {
	// The feedback question is worded by intent: "Why would you like to cancel?"
	// on the cancel path and "Why would you like to remove?" on the refund-and-
	// remove (`intent=remove`) path this flow drives. Match either.
	await page
		.getByRole( 'radiogroup', { name: /Why would you like to (cancel|remove)\?/ } )
		.getByRole( 'radio', { name: feedback.reason, exact: true } )
		.check();

	await page
		.getByRole( 'textbox', { name: 'Can you please specify?' } )
		.fill( feedback.customReasonText );

	// Submit the feedback step. This is not the final step, so the button reads
	// "Continue removal" rather than "Complete removal".
	await page
		.getByRole( 'button', { name: 'Continue removal', exact: true } )
		.click( { timeout: STEP_BUTTON_TIMEOUT } );

	// The next (and final) step asks where the user is headed next. Selecting an
	// answer enables the final step button.
	await page
		.getByRole( 'radiogroup', { name: 'Where is your next adventure taking you?' } )
		.getByRole( 'radio', { name: "I'm staying here and using the free plan.", exact: true } )
		.check();

	// Submitting the final step fires the cancel-and-refund request.
	const cancelResponsePromise = waitForUpgradeCancel( page );

	// The final step button also offers a "Skip and remove" shortcut alongside
	// "Complete removal"; take the one that submits the answers.
	await page
		.getByRole( 'button', { name: 'Complete removal', exact: true } )
		.click( { timeout: STEP_BUTTON_TIMEOUT } );

	// Completing the survey does not trigger a full-page navigation: the
	// dashboard updates in place as a single-page-app state change. Block until
	// the cancel request actually resolves so the caller's snackbar assertion
	// only has to cover the notice render, not the full network round-trip —
	// the success snackbar auto-dismisses shortly after it appears.
	await cancelResponsePromise;
}

/**
 * Completes the Multi-site Dashboard removal survey for a non-plan upgrade being
 * removed with a refund (eg. a storage add-on).
 *
 * A non-plan upgrade's survey is a single step — the optional "What's one thing
 * we could have done better?" free-text field — with none of the reason or
 * next-adventure questions a plan removal asks. `cancelDashboardPurchaseFlow`
 * covers the richer plan survey.
 *
 * @param page Page the survey is rendered on.
 * @param feedback Answers to give to the survey.
 * @param feedback.improvementText Free-text answer to the improvement question.
 */
export async function removeDashboardUpgradeFlow(
	page: Page,
	feedback: { improvementText: string }
) {
	// The field's accessible name resolves to its "Optional" placeholder rather
	// than its visible label.
	await page.getByRole( 'textbox', { name: 'Optional' } ).fill( feedback.improvementText );

	const cancelResponsePromise = waitForUpgradeCancel( page );

	await page
		.getByRole( 'button', { name: 'Complete removal', exact: true } )
		.click( { timeout: STEP_BUTTON_TIMEOUT } );

	await cancelResponsePromise;
}
