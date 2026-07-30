import { Page } from 'playwright';

// See cancel-dashboard-purchase-flow.ts: the survey's step buttons are disabled
// while the cancel-and-refund request is in flight, and the default action
// timeout is too tight for that round-trip in the test environment.
const STEP_BUTTON_TIMEOUT = 30 * 1000;

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

	// Start listening for the cancel-and-refund response before clicking so the
	// listener cannot miss a fast response, then block on it so the caller's
	// snackbar assertion only has to catch the notice render (it auto-dismisses).
	const cancelResponsePromise = page.waitForResponse(
		( response ) =>
			response.request().method() === 'POST' && /\/upgrades\/\d+\/cancel/.test( response.url() ),
		{ timeout: 60 * 1000 }
	);

	await page
		.getByRole( 'button', { name: 'Complete removal', exact: true } )
		.click( { timeout: STEP_BUTTON_TIMEOUT } );

	await cancelResponsePromise;
}
