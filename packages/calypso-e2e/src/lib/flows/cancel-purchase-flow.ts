import { Page } from 'playwright';

type CancelReason = 'Another reason…';

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

	await page.getByRole( 'button', { name: /Submit and (remove|cancel) plan/ } ).click();
}
