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
		.getByRole( 'combobox', { name: 'WHY WOULD YOU LIKE TO CANCEL?' } )
		.selectOption( feedback.reason );

	await page
		.getByRole( 'textbox', { name: 'CAN YOU PLEASE SPECIFY?' } )
		.fill( feedback.customReasonText );

	await page.getByRole( 'button', { name: 'Submit' } ).click();

	await page.getByRole( 'button', { name: /Submit and (remove|cancel) plan/ } ).click();
}
