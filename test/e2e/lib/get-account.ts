import { TestAccount, TestAccountName } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

/**
 * Retrieves a `TestAccount` instance for the specified account name, ensuring it has fresh authentication cookies.
 *
 * If the account does not have fresh authentication cookies, this function takes the account's
 * login lock and either adopts the cookies another worker wrote while it waited or logs in via
 * the login page and saves the new cookies for the other workers to reuse.
 *
 * @param {Page} page - The Playwright `Page` instance to use for authentication actions.
 * @param {TestAccountName} accountName - The name of the test account to retrieve.
 * @returns {Promise< TestAccount >} A promise that resolves to a `TestAccount` instance with valid authentication cookies.
 */
export async function getAccount(
	page: Page,
	accountName: TestAccountName
): Promise< TestAccount > {
	const testAccount = new TestAccount( accountName );
	if ( ! ( await testAccount.hasFreshAuthCookies() ) ) {
		await testAccount.ensureFreshAuthCookies( page );
	}
	return testAccount;
}
