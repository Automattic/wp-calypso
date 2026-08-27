import { BrowserManager, DataHelper, RestAPIClient } from '@automattic/calypso-e2e';
import {
	getBlackboxTestLoopUser,
	useBlackboxTestKeyForCollect,
	waitForCollectData,
	type BlackboxTestCollectOutcome,
} from '../../lib/blackbox-test-key';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';
import type { CartCheckoutPage, NewUserResponse } from '@automattic/calypso-e2e';
import type { Page, Request } from '@playwright/test';

const waitForUsersNewRequest = ( page: Page ): Promise< Request > =>
	page.waitForRequest(
		( request ) => request.method() === 'POST' && /\/users\/new/.test( request.url() ),
		{ timeout: 60 * 1000 }
	);

/**
 * Blackbox verdicts on logged-out Jetpack siteless checkout
 * (`/checkout/jetpack/:product`). Account creation happens on Pay via
 * `/users/new`. A block must reject that signup before a transaction starts;
 * createAccount() then resets Blackbox so a new session is collected.
 */
test.describe( 'Checkout: Blackbox userless Jetpack', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	const productSlug = 'jetpack_backup_t1_yearly';
	const cartItemName = 'VaultPress Backup';

	const accountsToCleanup: { user: NewUserResponse[ 'body' ]; password: string; email: string }[] =
		[];

	test.afterAll( async function () {
		for ( const account of accountsToCleanup ) {
			console.log(
				`[blackbox-userless] user_id=${ account.user.user_id } username=${ account.user.username } email=${ account.email }`
			);
			const restAPIClient = new RestAPIClient(
				{ username: account.user.username, password: account.password },
				account.user.bearer_token
			);
			await cancelAccountPurchases( restAPIClient, account.user.user_id );
			await apiCloseAccount( restAPIClient, {
				userID: account.user.user_id,
				username: account.user.username,
				email: account.email,
			} );
		}
	} );

	test( 'As a logged-out user, I see a challenge and cannot pay while it is active', async ( {
		helperData,
		page,
		pageCartCheckout,
	} ) => {
		const testUser = getBlackboxTestLoopUser();

		await test.step( 'Given Blackbox collect uses the public challenge test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'challenge' );
		} );

		await test.step( 'And store cookies are set for purchases', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
		} );

		const collectData = waitForCollectData( page );

		await test.step( 'When I visit Jetpack siteless checkout', async function () {
			await openUserlessCheckout( page, pageCartCheckout, helperData.getCalypsoURL );

			const collectBody = await collectData;
			expect( collectBody?.data?.session_id ).toBe( 'bbtest_challenge______' );
			expect( collectBody?.data?.challenge ).toBeTruthy();
		} );

		await test.step( 'And I complete the contact step', async function () {
			await completeContactStep( page, testUser.email );
		} );

		await test.step( 'Then the challenge widget is shown and Pay is blocked', async function () {
			await expect(
				page.locator( '.login__form-blackbox-challenge.has-visible-challenge' )
			).toBeVisible();
			await expect( page.getByRole( 'button', { name: /Pay (now|with)/ } ) ).toBeDisabled();
		} );
	} );

	test( 'As a logged-out user, I can complete purchase when Blackbox returns allow', async ( {
		helperData,
		page,
		pageCartCheckout,
	} ) => {
		test.setTimeout( 180 * 1000 );
		const expectedSessionId = 'bbtest_allow__________';
		const testUser = await startCheckoutThroughPaymentDetails( {
			page,
			pageCartCheckout,
			getCalypsoURL: helperData.getCalypsoURL,
			outcome: 'allow',
			expectedSessionId,
		} );

		await test.step( 'When I complete the purchase', async function () {
			const usersNewRequest = waitForUsersNewRequest( page );
			const usersNewResponse = page.waitForResponse(
				( response ) =>
					response.request().method() === 'POST' && /\/users\/new/.test( response.url() ),
				{ timeout: 60 * 1000 }
			);

			await pageCartCheckout.purchase( { timeout: 90 * 1000 } );

			const request = await usersNewRequest;
			expect( request.postDataJSON()?.blackbox_session_id ).toBe( expectedSessionId );

			const createdUser = parseCreatedUser( await ( await usersNewResponse ).json() );
			// Queue teardown before asserting so a created account never leaks.
			if ( createdUser ) {
				accountsToCleanup.push( {
					user: createdUser,
					password: testUser.password,
					email: testUser.email,
				} );
			}
			expect( createdUser?.user_id ).toBeTruthy();
			expect( createdUser?.bearer_token ).toBeTruthy();
		} );

		await test.step( 'Then I land on the Jetpack siteless thank-you page', async function () {
			await page.waitForURL( /\/checkout\/jetpack\/thank-you\/licensing-auto-activate\//, {
				timeout: 60 * 1000,
			} );
		} );
	} );

	test( 'As a logged-out user, I cannot complete purchase when Blackbox returns block', async ( {
		helperData,
		page,
		pageCartCheckout,
	} ) => {
		test.setTimeout( 180 * 1000 );
		const expectedSessionId = 'bbtest_block__________';
		const testUser = await startCheckoutThroughPaymentDetails( {
			page,
			pageCartCheckout,
			getCalypsoURL: helperData.getCalypsoURL,
			outcome: 'block',
			expectedSessionId,
		} );

		await test.step( 'When I try to pay', async function () {
			const nextCollect = waitForCollectData( page );
			const usersNewRequest = waitForUsersNewRequest( page );
			const usersNewResponse = page.waitForResponse(
				( response ) =>
					response.request().method() === 'POST' && /\/users\/new/.test( response.url() ),
				{ timeout: 60 * 1000 }
			);

			const transactionUrls: string[] = [];
			const trackTransactions = ( request: Request ) => {
				if ( request.method() === 'POST' && /me\/transactions/.test( request.url() ) ) {
					transactionUrls.push( request.url() );
				}
			};
			page.on( 'request', trackTransactions );

			try {
				const payButton = page.getByRole( 'button', { name: /Pay (now|with)/ } );
				await expect( payButton ).toBeEnabled( { timeout: 30 * 1000 } );
				await payButton.click();

				const request = await usersNewRequest;
				expect( request.postDataJSON()?.blackbox_session_id ).toBe( expectedSessionId );

				const body = await ( await usersNewResponse ).json();
				const createdUser = parseCreatedUser( body );
				// Queue teardown before asserting so a created account never leaks.
				if ( createdUser ) {
					accountsToCleanup.push( {
						user: createdUser,
						password: testUser.password,
						email: testUser.email,
					} );
				}

				expect( createdUser ).toBeNull();
				expect( usersNewErrorCode( body ) ).toBe( 'throttled' );

				const collectBody = await nextCollect;
				expect( collectBody?.data?.session_id ).toBeTruthy();
				expect( transactionUrls ).toEqual( [] );
			} finally {
				page.off( 'request', trackTransactions );
			}
		} );

		await test.step( 'Then I remain on checkout with an error', async function () {
			await expect( page ).toHaveURL( /\/checkout\/jetpack\// );
			expect( page.url() ).not.toMatch( /thank-you/ );
			await expect( page.locator( '.calypso-notice.is-error' ) ).toBeVisible();
		} );
	} );

	async function openUserlessCheckout(
		page: Page,
		pageCartCheckout: CartCheckoutPage,
		getCalypsoURL: ( path: string ) => string
	) {
		await page.goto( getCalypsoURL( `/checkout/jetpack/${ productSlug }` ) );
		await pageCartCheckout.validateCartItem( cartItemName );
	}

	async function completeContactStep( page: Page, email: string ) {
		const paymentDetails = DataHelper.getTestPaymentDetails();
		await page.locator( '#email' ).fill( email );
		// Postal is hidden until a country is chosen on siteless checkout.
		await page
			.locator( 'select[aria-labelledby="country-selector-label"]' )
			.selectOption( paymentDetails.countryCode );
		const postalCode = page.locator( 'input[id="contact-postal-code"]' );
		if ( await postalCode.isVisible() ) {
			await postalCode.fill( paymentDetails.postalCode );
		}
		await page
			.locator( '[data-testid="contact-form--visible"] button.checkout-button.is-status-primary' )
			.click();
	}

	async function startCheckoutThroughPaymentDetails( {
		page,
		pageCartCheckout,
		getCalypsoURL,
		outcome,
		expectedSessionId,
	}: {
		page: Page;
		pageCartCheckout: CartCheckoutPage;
		getCalypsoURL: ( path: string ) => string;
		outcome: BlackboxTestCollectOutcome;
		expectedSessionId: string;
	} ) {
		const testUser = getBlackboxTestLoopUser();
		const paymentDetails = DataHelper.getTestPaymentDetails();

		await test.step( `Given Blackbox collect uses the public ${ outcome } test key`, async function () {
			await useBlackboxTestKeyForCollect( page, outcome );
		} );

		await test.step( 'And store cookies are set for purchases', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
		} );

		const collectData = waitForCollectData( page );

		await test.step( 'When I visit Jetpack siteless checkout', async function () {
			await openUserlessCheckout( page, pageCartCheckout, getCalypsoURL );

			const collectBody = await collectData;
			expect( collectBody?.data?.session_id ).toBe( expectedSessionId );
		} );

		await test.step( 'And I complete the contact step', async function () {
			await completeContactStep( page, testUser.email );
		} );

		await test.step( 'And I enter payment details', async function () {
			await pageCartCheckout.enterPaymentDetails( paymentDetails );
		} );

		return testUser;
	}
} );

function usersNewBody( json: unknown ): Record< string, unknown > | null {
	if ( ! json || typeof json !== 'object' ) {
		return null;
	}
	const record = json as Record< string, unknown >;
	return ( record.body && typeof record.body === 'object' ? record.body : record ) as Record<
		string,
		unknown
	>;
}

function usersNewErrorCode( json: unknown ): string | undefined {
	const error = usersNewBody( json )?.error;
	return typeof error === 'string' ? error : undefined;
}

function parseCreatedUser( json: unknown ): NewUserResponse[ 'body' ] | null {
	const body = usersNewBody( json );
	if ( ! body ) {
		return null;
	}
	const rawUserID = body.user_id;
	const userID =
		typeof rawUserID === 'number' || typeof rawUserID === 'string' ? Number( rawUserID ) : NaN;
	if (
		body.success !== true ||
		! Number.isInteger( userID ) ||
		userID <= 0 ||
		typeof body.username !== 'string' ||
		typeof body.bearer_token !== 'string'
	) {
		return null;
	}
	return {
		success: true,
		user_id: userID,
		username: body.username,
		bearer_token: body.bearer_token,
	};
}

async function cancelAccountPurchases( client: RestAPIClient, userId: number ): Promise< void > {
	try {
		const purchases = await client.getAllPurchases();
		console.log(
			`[blackbox-userless] user_id=${ userId } purchases=${ purchases.length }`,
			purchases.map( ( purchase ) => ( {
				id: purchase.ID,
				product_id: purchase.product_id,
				product_slug: purchase.product_slug,
				blog_id: purchase.blog_id,
			} ) )
		);
		for ( const purchase of purchases ) {
			console.log(
				`[blackbox-userless] cancelling purchase id=${ purchase.ID } slug=${ purchase.product_slug }`
			);
			const result = await client.cancelPurchase( purchase.ID, {
				product_id: purchase.product_id,
				cancel_bundled_domain: 0,
				email_variant: 'control',
			} );
			console.log( `[blackbox-userless] cancel result for purchase id=${ purchase.ID }`, result );
		}
	} catch ( error ) {
		console.warn(
			`[blackbox-userless] Error cancelling purchases for user_id=${ userId } (continuing to account close): ${ error }`
		);
	}
}
