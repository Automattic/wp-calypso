import type { Page } from '@playwright/test';

const BLACKBOX_COLLECT_ROUTE = 'https://blackbox-api.wp.com/v1/collect**';

// Intentionally public Blackbox test collect keys (bbtest_* outcomes).
export const BLACKBOX_TEST_COLLECT_KEYS = {
	allow: '1xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
	block: '2xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
	challenge: '3xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

export type BlackboxTestCollectOutcome = keyof typeof BLACKBOX_TEST_COLLECT_KEYS;

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
