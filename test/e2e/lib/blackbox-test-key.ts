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

// Aborts the collect instead of keying it, leaving the SDK without a session.
// The server only attaches a challenge to the collect that mints a session,
// never to a recollect, so this is how a test arranges for the mint — and
// therefore the challenge — to happen on the collect the submit fires.
export type BlackboxTestCollectStep = BlackboxTestCollectOutcome | 'unavailable';

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
	outcome: BlackboxTestCollectStep | BlackboxTestCollectStep[] = 'allow'
): Promise< void > {
	// In a sequence, the last entry applies to every collect after it.
	const outcomes = Array.isArray( outcome ) ? outcome : [ outcome ];
	let collectsSeen = 0;
	const currentStep = () => outcomes[ Math.min( collectsSeen, outcomes.length - 1 ) ];

	await page.unroute( BLACKBOX_COLLECT_ROUTE );
	await page.route( BLACKBOX_COLLECT_ROUTE, async ( route ) => {
		const request = route.request();
		const step = currentStep();

		if ( request.method() === 'GET' ) {
			if ( step === 'unavailable' ) {
				await route.abort();
				return;
			}
			const url = new URL( request.url() );
			url.searchParams.set( 'apikey', BLACKBOX_TEST_COLLECT_KEYS[ step ] );
			await route.continue( { url: url.toString() } );
			return;
		}

		if ( request.method() !== 'POST' ) {
			await route.continue();
			return;
		}

		collectsSeen++;

		if ( step === 'unavailable' ) {
			await route.abort();
			return;
		}

		await route.continue( {
			headers: {
				...request.headers(),
				'x-blackbox-api-key': BLACKBOX_TEST_COLLECT_KEYS[ step ],
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
