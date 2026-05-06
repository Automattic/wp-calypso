import wpcom from 'calypso/lib/wp';

// SSR safety: Fail TypeScript compilation if `window` is used without an explicit undefined check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: undefined | ( Window & typeof globalThis );

export default function fetchFlagPayload(): Promise< unknown > {
	return wpcom.req.get( {
		path: '/experiments/0.1.0/flags/calypso',
		apiNamespace: 'wpcom/v2',
	} );
}
