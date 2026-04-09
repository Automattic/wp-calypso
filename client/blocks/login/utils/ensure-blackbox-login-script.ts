import config from '@automattic/calypso-config';
import { BLACKBOX_CHALLENGE_ROOT_ID } from 'calypso/blocks/login/utils/blackbox-challenge-root-id';

const BLACKBOX_HOST_MARKER = 'blackbox-api.wp.com';
const BLACKBOX_CHALLENGE_START_HANDLER = '__calypsoBlackboxOnChallengeStart';
const BLACKBOX_CHALLENGE_COMPLETE_HANDLER = '__calypsoBlackboxOnChallengeComplete';

let loadPromise: Promise< void > | null = null;

function dispatchBlackboxChallengeStart() {
	window.dispatchEvent( new CustomEvent( 'blackbox:challenge-start' ) );
}

function dispatchBlackboxChallengeComplete() {
	window.dispatchEvent( new CustomEvent( 'blackbox:challenge-complete' ) );
}

function getCspNonceForScripts(): string | undefined {
	const el = document.querySelector( 'script[nonce]' );
	if ( el instanceof HTMLScriptElement && el.nonce ) {
		return el.nonce;
	}
	return el?.getAttribute( 'nonce' ) ?? undefined;
}

/**
 * Installs global names the loader may call via `data-on-challenge-*` attributes.
 * Safe to call repeatedly; must run before the Blackbox script executes.
 */
export function ensureBlackboxChallengeHooks() {
	const win = window as Window & {
		[ BLACKBOX_CHALLENGE_START_HANDLER ]?: () => void;
		[ BLACKBOX_CHALLENGE_COMPLETE_HANDLER ]?: () => void;
	};

	if ( ! win[ BLACKBOX_CHALLENGE_START_HANDLER ] ) {
		win[ BLACKBOX_CHALLENGE_START_HANDLER ] = dispatchBlackboxChallengeStart;
	}

	if ( ! win[ BLACKBOX_CHALLENGE_COMPLETE_HANDLER ] ) {
		win[ BLACKBOX_CHALLENGE_COMPLETE_HANDLER ] = dispatchBlackboxChallengeComplete;
	}
}

type BlackboxRuntimePartialConfig = {
	apiKey: string;
	challengeContainer: string;
	onChallengeStart?: () => void;
	onChallengeComplete?: () => void;
};

function getBlackboxRuntimeConfig(): BlackboxRuntimePartialConfig | null {
	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return null;
	}

	return {
		apiKey: config( 'blackbox_api_key' ),
		challengeContainer: `#${ BLACKBOX_CHALLENGE_ROOT_ID }`,
		onChallengeStart: dispatchBlackboxChallengeStart,
		onChallengeComplete: dispatchBlackboxChallengeComplete,
	};
}

/**
 * If the runtime supports programmatic config, register challenge callbacks after load.
 * v.js may ignore unknown `data-*` hooks; this keeps submit-disable in sync with the real API.
 *
 * Pass `apiKey` and `challengeContainer` together with callbacks: some runtimes treat
 * `configure()` as a full replace, which would otherwise drop the key from `data-apikey`.
 */
function tryRegisterBlackboxRuntimeCallbacks() {
	const bb = window.Blackbox as
		| ( NonNullable< typeof window.Blackbox > & {
				configure?: ( c: BlackboxRuntimePartialConfig ) => void;
				setConfig?: ( c: BlackboxRuntimePartialConfig ) => void;
		  } )
		| undefined;
	if ( ! bb ) {
		return;
	}

	const runtimeConfig = getBlackboxRuntimeConfig();
	if ( ! runtimeConfig ) {
		return;
	}

	if ( typeof bb.configure === 'function' ) {
		try {
			bb.configure( runtimeConfig );
		} catch {
			// Intentionally ignored — Blackbox must never block login.
		}
	}

	if ( typeof bb.setConfig === 'function' ) {
		try {
			bb.setConfig( runtimeConfig );
		} catch {
			// Intentionally ignored — Blackbox must never block login.
		}
	}
}

/**
 * Injects Blackbox-js after the login form mount so the library does not run at page boot.
 * The challenge container node must already be in the DOM before the script executes.
 */
export function ensureBlackboxLoginScript(): Promise< void > {
	if ( typeof document === 'undefined' ) {
		return Promise.resolve();
	}

	// Always install globals first so they exist if/when the loader reads `data-on-challenge-*`.
	ensureBlackboxChallengeHooks();

	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return Promise.resolve();
	}

	if ( window.Blackbox?.collect ) {
		tryRegisterBlackboxRuntimeCallbacks();
		return Promise.resolve();
	}

	if ( loadPromise ) {
		return loadPromise;
	}

	loadPromise = new Promise( ( resolve ) => {
		const finish = () => resolve();

		const existing = document.querySelector< HTMLScriptElement >(
			`script[src*="${ BLACKBOX_HOST_MARKER }"]`
		);

		if ( existing ) {
			const onBlackboxReady = () => {
				tryRegisterBlackboxRuntimeCallbacks();
				finish();
			};

			if ( window.Blackbox?.collect ) {
				onBlackboxReady();
				return;
			}
			existing.addEventListener( 'load', onBlackboxReady, { once: true } );
			existing.addEventListener( 'error', finish, { once: true } );
			setTimeout( onBlackboxReady, 10000 );
			return;
		}

		const script = document.createElement( 'script' );
		script.src = config( 'blackbox_url' );
		const nonce = getCspNonceForScripts();
		if ( nonce ) {
			script.nonce = nonce;
		}
		script.setAttribute( 'data-apikey', config( 'blackbox_api_key' ) );
		script.setAttribute( 'data-challenge-container', `#${ BLACKBOX_CHALLENGE_ROOT_ID }` );
		script.setAttribute( 'data-on-challenge-start', BLACKBOX_CHALLENGE_START_HANDLER );
		script.setAttribute( 'data-on-challenge-complete', BLACKBOX_CHALLENGE_COMPLETE_HANDLER );

		script.addEventListener(
			'load',
			() => {
				tryRegisterBlackboxRuntimeCallbacks();
				finish();
			},
			{ once: true }
		);
		script.addEventListener( 'error', finish, { once: true } );
		setTimeout( () => {
			tryRegisterBlackboxRuntimeCallbacks();
			finish();
		}, 10000 );

		document.body.appendChild( script );
	} );

	return loadPromise;
}
