import config from 'config';
import { Page } from 'playwright';

/**
 * Sets the store cookie, used for simulating payment processing.
 *
 * Optinally, set the `currency` parameter to specify the currency to be used in the checkout.
 *
 * @param {Page} page Object representing a page launched by Playwright.
 * @param {string} currency ISO 4217-compliant currency code.
 */
export async function setStoreCookie(
	page: Page,
	{ currency }: { currency?: string } = {}
): Promise< void > {
	const browserContext = page.context();

	await browserContext.addCookies( [
		{
			name: 'store_sandbox',
			value: config.get( 'storeSandboxCookieValue' ) as string,
			domain: '.wordpress.com',
			path: '/',
			sameSite: 'None',
			secure: true,
		},
	] );

	if ( currency ) {
		await browserContext.addCookies( [
			{
				name: 'landingpage_currency',
				value: currency,
				domain: '.wordpress.com',
				path: '/',
				sameSite: 'None',
				secure: true,
			},
		] );
	}
}
