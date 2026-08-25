import { TestAccount, TestAccountName } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

/**
 * Retrieves a `TestAccount` instance for the specified account name, ensuring it has fresh authentication cookies.
 *
 * If the account does not have fresh authentication cookies, this function will log in via the login page
 * and save the new authentication cookies to the browser context.
 *
 * @param {Page} page - The Playwright `Page` instance to use for authentication actions.
 * @param {TestAccountName} accountName - The name of the test account to retrieve.
 * @returns {Promise< TestAccount >} A promise that resolves to a `TestAccount` instance with valid authentication cookies.
 */
export async function getAccount(
	page: Page,
	accountName: TestAccountName,
	{ isPriming = false }: { isPriming?: boolean } = {}
): Promise< TestAccount > {
	const testAccount = new TestAccount( accountName );
	if ( ! ( await testAccount.hasFreshAuthCookies() ) ) {
		if ( ! isPriming ) {
			// The prime-logins setup project should have left cookies for this account. Say so
			// when it didn't: a quiet run means priming worked, and a noisy one names the
			// accounts that fell back to logging in one worker at a time.
			console.log( `Logging in as ${ accountName }, no primed cookies to reuse.` );
		}
		await testAccount.logInViaLoginPage( page );
		await testAccount.saveAuthCookies( page.context() );
	}
	return testAccount;
}
