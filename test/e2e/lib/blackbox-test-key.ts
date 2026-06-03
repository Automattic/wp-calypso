import type { Page } from '@playwright/test';

// Intentionally public Blackbox test key. It mirrors Turnstile-style test keys and
// always allows `/v1/collect`, so auth E2E tests do not depend on live challenges.
const BLACKBOX_ALWAYS_ALLOW_PUBLIC_TEST_KEY = '1xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export async function useBlackboxTestKeyForCollect( page: Page ): Promise< void > {
	await page.route( 'https://blackbox-api.wp.com/v1/collect**', async ( route ) => {
		const request = route.request();

		if ( request.method() === 'GET' ) {
			const url = new URL( request.url() );
			url.searchParams.set( 'apikey', BLACKBOX_ALWAYS_ALLOW_PUBLIC_TEST_KEY );
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
				'x-blackbox-api-key': BLACKBOX_ALWAYS_ALLOW_PUBLIC_TEST_KEY,
			},
		} );
	} );
}
