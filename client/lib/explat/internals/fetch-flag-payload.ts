import wpcom from 'calypso/lib/wp';

// SSR safety: Fail TypeScript compilation if `window` is used without an explicit undefined check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: undefined | ( Window & typeof globalThis );

export default function fetchFlagPayload(): Promise< unknown > {
	return wpcom.req.get(
		{
			path: '/experiments/0.1.0/flags/calypso',
			apiNamespace: 'wpcom/v2',
		},
		// `source=db` reads through to the authoritative store rather than
		// the CDN-cached blob, so newly-created flags appear without waiting
		// for cache expiry. Worth the per-page-load round trip for now;
		// revisit before this ships to general production users.
		{ source: 'db' }
	);
}
