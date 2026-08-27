import { DataHelper } from '@automattic/calypso-e2e';
import type { NewTestUserDetails } from '@automattic/calypso-e2e';
import type { Page } from '@playwright/test';

const BLACKBOX_COLLECT_ROUTE = 'https://blackbox-api.wp.com/v1/collect**';

// Intentionally public Blackbox test collect keys (bbtest_* outcomes).
export const BLACKBOX_TEST_COLLECT_KEYS = {
	allow: '1xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
	block: '2xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
	challenge: '3xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

export type BlackboxTestCollectOutcome = keyof typeof BLACKBOX_TEST_COLLECT_KEYS;

export type BlackboxCollectBody = {
	data?: { session_id?: string; challenge?: unknown };
};

/**
 * Resolves with the parsed body of the next Blackbox collect POST.
 *
 * The body is read as it arrives, not from the resolved Response: once the
 * signup succeeds and Calypso navigates, the browser evicts the body and a
 * later response.json() fails with "No resource with given identifier found"
 * or "Target page, context or browser has been closed".
 */
export function waitForCollectData( page: Page ): Promise< BlackboxCollectBody > {
	return page
		.waitForResponse(
			( response ) =>
				response.request().method() === 'POST' &&
				response.url().includes( 'blackbox-api.wp.com/v1/collect' ),
			{ timeout: 60 * 1000 }
		)
		.then( ( response ) => response.json() );
}

export async function useBlackboxTestKeyForCollect(
	page: Page,
	outcome: BlackboxTestCollectOutcome = 'allow'
): Promise< void > {
	const collectKey = BLACKBOX_TEST_COLLECT_KEYS[ outcome ];

	await page.unroute( BLACKBOX_COLLECT_ROUTE );
	await page.route( BLACKBOX_COLLECT_ROUTE, async ( route ) => {
		const request = route.request();

		if ( request.method() === 'GET' ) {
			const url = new URL( request.url() );
			url.searchParams.set( 'apikey', collectKey );
			await route.continue( { url: url.toString() } );
			return;
		}

		if ( request.method() !== 'POST' ) {
			await route.continue();
			return;
		}

		await route.continue( {
			headers: {
				...request.headers(),
				'x-blackbox-api-key': collectKey,
			},
		} );
	} );
}

/**
 * Siteless / passwordless signup generates the username from the email.
 * A Mailosaur address is `e2eflowtestingblackbox<id>@inbox.mailosaur.net`,
 * which sanitizes to a test-loop username and passes close-account email checks.
 */
export function getBlackboxTestLoopUser(): NewTestUserDetails {
	return DataHelper.getNewTestUser( { usernamePrefix: 'blackbox', useMailosaur: true } );
}
