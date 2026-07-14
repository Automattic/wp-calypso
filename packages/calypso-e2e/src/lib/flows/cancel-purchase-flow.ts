import { Locator, Page } from 'playwright';

type CancelReason = 'Another reason…';

/**
 * Clicks a button locator once it is both visible and actually enabled.
 *
 * The survey's step button is disabled until the step's required answers are
 * filled in, and again while the request is in flight. Waiting for the
 * `disabled` attribute to clear guarantees the click lands on an enabled button.
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
 * Returns a locator matching the survey's primary step button.
 *
 * Every step, including the last, advances with "Continue".
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
 * Callers must start listening before the click that fires it.
 *
 * @param {Page} page Page object the survey is rendered on.
 * @returns {Promise} Promise resolving once the cancellation request resolves.
 */
function waitForCancelResponse( page: Page ) {
	return page.waitForResponse( ( response ) => /\/upgrades\/\d+\/cancel/.test( response.url() ), {
		// A refund is a real server round-trip, so allow a generous window.
		timeout: 60 * 1000,
	} );
}

/**
 * Completes the cancellation survey for a non-plan subscription (e.g. a storage add-on).
 *
 * These get a single survey step whose only field is optional.
 */
export async function cancelSubscriptionFlow( page: Page ) {
	const cancelResponsePromise = waitForCancelResponse( page );

	await clickWhenEnabled( surveyStepButton( page ) );

	await cancelResponsePromise;
}

/**
 * Completes the cancellation survey for a plan.
 *
 * A plan gets two steps: why you are cancelling, then where you are going next.
 * Both are required.
 */
export async function cancelAtomicPurchaseFlow(
	page: Page,
	feedback: {
		reason: CancelReason;
		customReasonText: string;
	}
) {
	// "Another reason…" reveals a free-text field and skips the upsell step.
	await page.getByRole( 'radio', { name: feedback.reason } ).check();
	await page
		.getByRole( 'textbox', { name: 'Can you please specify?' } )
		.fill( feedback.customReasonText );

	await clickWhenEnabled( surveyStepButton( page ) );

	await page.getByRole( 'radio', { name: "I'm staying here and using the free plan." } ).check();

	// Listen before clicking so a fast response cannot be missed.
	const cancelResponsePromise = waitForCancelResponse( page );

	await clickWhenEnabled( surveyStepButton( page ) );

	// Block until the refund resolves, so the caller's snackbar assertion isn't
	// racing the round-trip.
	await cancelResponsePromise;
}
