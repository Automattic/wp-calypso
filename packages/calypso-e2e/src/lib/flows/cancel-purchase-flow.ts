import { Page } from 'playwright';

type CancelReason = 'Another reason…';

/**
 * Cancels a purchased subscription.
 */
export async function cancelSubscriptionFlow( page: Page ) {
	await page.getByRole( 'button', { name: 'Submit and cancel product' } ).click();
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
		page.waitForNavigation(),
		page.getByRole( 'button', { name: /Submit and (remove|cancel) plan/ } ).click(),
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

	// Submit first step.
	await page.getByRole( 'button', { name: 'Submit' } ).click();

	// Submit second step.
	await page.getByRole( 'button', { name: 'Submit' } ).click();

	// Submit caution step.
	await page.getByRole( 'checkbox', { name: 'Any themes/plugins you have installed' } ).click();
	await page.getByRole( 'checkbox', { name: 'your site will return to its original' } ).click();

	const hasContentCheck = page.getByRole( 'checkbox', {
		name: 'Your posts, pages, and media added after upgrading will be automatically imported to your downgraded site.',
	} );

	if ( await hasContentCheck.isVisible() ) {
		await hasContentCheck.click();
	}

	await Promise.all( [
		page.waitForNavigation(),
		page.getByRole( 'button', { name: /Submit and cancel plan/ } ).click(),
	] );
}
