import type { MyAccountInformationResponse, RestAPIClient } from '@automattic/calypso-e2e';
import type { Page, Request } from 'playwright';

const POLL_INTERVAL = 1000;
const POLL_TIMEOUT = 30 * 1000;
const LOG_PREFIX = '[email-verification]';

// `RestAPIClient` surfaces API failures as `Error( '<code>: <message>' )`
// without the HTTP status, so transient failures are recognized by known
// message signatures instead. Anything else is rethrown immediately.
const TRANSIENT_ERROR_PATTERNS = [
	/invalid_token/, // Token minted at signup not yet accepted (read-after-write lag).
	/internal_server_error/,
	/service_unavailable/,
	/Failed to parse JSON/, // Non-JSON 5xx body, e.g. an HTML error page from an intermediary.
	/fetch failed/, // Network-level failure.
];

/**
 * Checks whether an error thrown while calling the API looks transient.
 *
 * @param {unknown} error Error thrown by `RestAPIClient`.
 * @returns {boolean} Whether the call is worth retrying.
 */
function isTransientError( error: unknown ): boolean {
	const message = error instanceof Error ? error.message : String( error );
	return TRANSIENT_ERROR_PATTERNS.some( ( pattern ) => pattern.test( message ) );
}

function sanitizeURL( url: string ): string {
	try {
		const parsedURL = new URL( url );
		const pathname = parsedURL.pathname.replace( /(\/activate\/)[^/]+/gi, '$1[redacted]' );
		return `${ parsedURL.origin }${ pathname }`;
	} catch {
		return '[invalid-url]';
	}
}

function getURLSecrets( url: string ): string[] {
	try {
		const parsedURL = new URL( url );
		const values = [ ...parsedURL.searchParams.values() ];
		const activationKeys = [ parsedURL.pathname, ...values ].flatMap( ( value ) =>
			[ ...value.matchAll( /\/activate\/([^/?#]+)/gi ) ].map( ( match ) => match[ 1 ] )
		);
		return [ ...values, parsedURL.hash.slice( 1 ), ...activationKeys ].filter( Boolean );
	} catch {
		return [];
	}
}

function sanitizeText( text: string, redactions: string[] = [] ): string {
	for ( const redaction of redactions ) {
		text = text.replaceAll( redaction, '[redacted]' );
	}
	return text
		.replace( /Bearer\s+\S+/gi, 'Bearer [redacted]' )
		.replace( /https?:\/\/[^\s"'<>]+/g, sanitizeURL );
}

function getErrorDetails(
	error: unknown,
	redactions?: string[]
): { class: string; message: string } {
	return {
		class: error instanceof Error ? error.name : typeof error,
		message: sanitizeText( error instanceof Error ? error.message : String( error ), redactions ),
	};
}

function logEmailVerification( record: Record< string, unknown > ): void {
	console.log( `${ LOG_PREFIX } ${ JSON.stringify( record ) }` );
}

async function getRedirectChain( request: Request | null | undefined ) {
	const requests: Request[] = [];
	for ( let current = request; current; current = current.redirectedFrom() ) {
		requests.unshift( current );
	}

	return Promise.all(
		requests.map( async ( current ) => ( {
			url: sanitizeURL( current.url() ),
			status: ( await current.response().catch( () => null ) )?.status() ?? null,
		} ) )
	);
}

/**
 * Visits an email activation link and logs sanitized navigation diagnostics.
 */
export async function visitEmailActivationLink(
	page: Page,
	activationLink: string,
	expectedEmail: string
): Promise< void > {
	const startedAt = Date.now();
	const activationSecrets = getURLSecrets( activationLink );
	let lastNavigationRequest: Request | undefined;
	let navigationError: unknown;
	let navigationSucceeded = false;
	const trackNavigationRequest = ( request: Request ) => {
		if ( request.isNavigationRequest() && request.frame() === page.mainFrame() ) {
			lastNavigationRequest = request;
		}
	};

	page.on( 'request', trackNavigationRequest );
	try {
		const response = await page.goto( activationLink );
		lastNavigationRequest = response?.request() ?? lastNavigationRequest;
		navigationSucceeded = true;
	} catch ( error ) {
		navigationError = error;
	} finally {
		page.off( 'request', trackNavigationRequest );
	}

	const endedAt = Date.now();
	const title = await page.title().catch( () => null );

	logEmailVerification( {
		event: 'activation',
		expectedEmail,
		startedAt: new Date( startedAt ).toISOString(),
		endedAt: new Date( endedAt ).toISOString(),
		durationMs: endedAt - startedAt,
		result: navigationSucceeded ? 'response' : 'error',
		redirectChain: await getRedirectChain( lastNavigationRequest ),
		finalUrl: sanitizeURL( page.url() ),
		title: title === null ? null : sanitizeText( title, activationSecrets ),
		...( navigationSucceeded
			? {}
			: { error: getErrorDetails( navigationError, activationSecrets ) } ),
	} );

	if ( ! navigationSucceeded ) {
		throw navigationError;
	}
}

/**
 * Polls the read-only `/me` endpoint until `until` holds for its response,
 * absorbing transient errors along the way.
 *
 * Implemented as a plain loop rather than `expect.poll`: this module is
 * re-exported by the shared barrel, which legacy Jest specs also import,
 * so it must not depend on `@playwright/test`.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {Function} until Predicate evaluated against each successful response.
 * @param {string} timeoutMessage Error message used when the timeout elapses.
 * @throws If a non-transient error occurs, or the timeout elapses.
 */
async function pollMyAccountInformation(
	client: RestAPIClient,
	until: ( me: MyAccountInformationResponse ) => boolean,
	timeoutMessage: string,
	diagnostics?: { expectedEmail: string }
): Promise< void > {
	const startedAt = Date.now();
	const deadline = startedAt + POLL_TIMEOUT;
	let attempts = 0;
	let lastError: unknown = null;
	while ( true ) {
		attempts++;
		const attemptStartedAt = Date.now();
		try {
			const me = await client.getMyAccountInformation();
			const complete = until( me );
			if ( diagnostics ) {
				logEmailVerification( {
					event: 'poll-attempt',
					expectedEmail: diagnostics.expectedEmail,
					attempt: attempts,
					timestamp: new Date( attemptStartedAt ).toISOString(),
					durationMs: Date.now() - attemptStartedAt,
					result: 'response',
					me: {
						ID: me.ID,
						email: me.email,
						email_verified: me.email_verified,
						emailMatchesExpected: me.email === diagnostics.expectedEmail,
					},
				} );
			}
			if ( complete ) {
				if ( diagnostics ) {
					const endedAt = Date.now();
					logEmailVerification( {
						event: 'poll-complete',
						expectedEmail: diagnostics.expectedEmail,
						result: 'complete',
						attempts,
						startedAt: new Date( startedAt ).toISOString(),
						endedAt: new Date( endedAt ).toISOString(),
						durationMs: endedAt - startedAt,
					} );
				}
				return;
			}
			// The call succeeded; the awaited flag has just not flipped yet.
			lastError = null;
		} catch ( error ) {
			const transient = isTransientError( error );
			if ( diagnostics ) {
				logEmailVerification( {
					event: 'poll-attempt',
					expectedEmail: diagnostics.expectedEmail,
					attempt: attempts,
					timestamp: new Date( attemptStartedAt ).toISOString(),
					durationMs: Date.now() - attemptStartedAt,
					result: transient ? 'transient-error' : 'fatal-error',
					error: getErrorDetails( error ),
				} );
			}
			if ( ! transient ) {
				throw error;
			}
			lastError = error;
		}
		if ( Date.now() + POLL_INTERVAL > deadline ) {
			break;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL ) );
	}
	if ( diagnostics ) {
		const endedAt = Date.now();
		logEmailVerification( {
			event: 'poll-timeout',
			expectedEmail: diagnostics.expectedEmail,
			result: 'timeout',
			attempts,
			startedAt: new Date( startedAt ).toISOString(),
			endedAt: new Date( endedAt ).toISOString(),
			durationMs: endedAt - startedAt,
		} );
	}
	throw new Error( lastError ? `${ timeoutMessage } Last error: ${ lastError }` : timeoutMessage );
}

/**
 * Waits until the API accepts the client's bearer token.
 *
 * The bearer token minted by the signup flow is not always accepted by the
 * API immediately (observed as `invalid_token` on the first authenticated
 * call in CI). Polls a read-only endpoint until the token is honoured so
 * that subsequent mutating calls (e.g. `createSite`) stay single-shot and
 * cannot leak a site.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {string} email Email of the user the token belongs to, for error reporting.
 * @throws If the token is still rejected when the timeout elapses.
 */
export async function apiWaitForBearerTokenAcceptance(
	client: RestAPIClient,
	email: string
): Promise< void > {
	await pollMyAccountInformation(
		client,
		() => true,
		`Bearer token for ${ email } was not accepted by the API after signup.`
	);
}

/**
 * Waits until the user's email reads as verified.
 *
 * Account activation is processed asynchronously on the backend: the
 * activation-link redirect can land before `email_verified` is readable by
 * later requests, and specs depend on a verified user (e.g. My Home hides
 * the domain-upsell card for unverified users).
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {string} email Email of the user being verified, for error reporting.
 * @throws If the flag is still unset when the timeout elapses.
 */
export async function apiWaitForEmailVerification(
	client: RestAPIClient,
	email: string
): Promise< void > {
	await pollMyAccountInformation(
		client,
		( me ) => me.email_verified === true,
		`Email verification for ${ email } did not propagate after visiting the activation link.`,
		{ expectedEmail: email }
	);
}
