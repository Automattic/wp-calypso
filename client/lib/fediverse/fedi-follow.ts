/**
 * Follow accounts on a Fediverse instance.
 *
 * Supports two methods:
 * 1. Mastodon-compatible API: search for account, then POST /api/v1/accounts/:id/follow
 * 2. ActivityPub C2S: POST a Follow activity to the user's outbox
 *
 * For Mastodon instances, uses the Mastodon API with C2S as fallback.
 * For ActivityPub OAuth instances (e.g. WordPress), uses C2S directly.
 */

import { getAuthState } from './fedi-auth';
import type { FediAccount } from './types';

export interface FollowResult {
	account: FediAccount;
	success: boolean;
	error?: string;
}

// ── Mastodon API methods ──

/**
 * Resolve a Fediverse account on the authenticated instance via Mastodon API.
 * Returns the instance-local account ID needed for the follow call.
 */
async function resolveAccount(
	instance: string,
	token: string,
	account: FediAccount
): Promise< string > {
	const handle = `@${ account.username }@${ account.instance }`;
	const params = new URLSearchParams( {
		q: handle,
		resolve: 'true',
		limit: '1',
		type: 'accounts',
	} );

	const response = await fetch( `https://${ instance }/api/v2/search?${ params.toString() }`, {
		headers: { Authorization: `Bearer ${ token }` },
	} );

	if ( ! response.ok ) {
		throw new Error( `Search failed: ${ response.status }` );
	}

	const data = await response.json();
	if ( ! data.accounts || data.accounts.length === 0 ) {
		throw new Error( `Account not found: ${ handle }` );
	}

	return data.accounts[ 0 ].id;
}

/**
 * Follow a single account using the Mastodon-compatible API.
 */
async function followViaMastodonApi(
	instance: string,
	token: string,
	account: FediAccount
): Promise< void > {
	const accountId = await resolveAccount( instance, token, account );

	const response = await fetch( `https://${ instance }/api/v1/accounts/${ accountId }/follow`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ token }`,
			'Content-Type': 'application/json',
		},
	} );

	if ( ! response.ok ) {
		const body = await response.json().catch( () => ( {} ) );
		throw new Error( body.error || `Follow failed: ${ response.status }` );
	}
}

// ── ActivityPub C2S methods ──

/**
 * Discover the authenticated user's ActivityPub actor URL.
 *
 * Tries multiple strategies in order:
 * 1. Stored actor URL from auth state (e.g. token response `me` field)
 * 2. OAuth token introspection (RFC 7662)
 * 3. Mastodon verify_credentials
 * 4. WordPress REST API /wp-json/wp/v2/users/me
 */
async function discoverActorUrl( instance: string, token: string ): Promise< string | null > {
	const authState = getAuthState();

	// 1. Check if we already have the actor URL from the token response.
	if ( authState?.actorUrl ) {
		return authState.actorUrl;
	}

	// 2. Try OAuth token introspection (RFC 7662).
	if ( authState?.introspectionEndpoint ) {
		try {
			const introResponse = await fetch( authState.introspectionEndpoint, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${ token }`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams( { token } ).toString(),
			} );
			if ( introResponse.ok ) {
				const introData = await introResponse.json();
				if ( introData.sub ) {
					return introData.sub;
				}
			}
		} catch {
			// Introspection not available — continue.
		}
	}

	// 3. Try Mastodon verify_credentials.
	try {
		const credResponse = await fetch( `https://${ instance }/api/v1/accounts/verify_credentials`, {
			headers: { Authorization: `Bearer ${ token }` },
		} );
		if ( credResponse.ok ) {
			const user = await credResponse.json();
			if ( user.url ) {
				return user.url;
			}
		}
	} catch {
		// Not Mastodon.
	}

	// 4. Try WordPress REST API.
	try {
		const wpMeResponse = await fetch( `https://${ instance }/wp-json/wp/v2/users/me`, {
			headers: { Authorization: `Bearer ${ token }` },
		} );
		if ( wpMeResponse.ok ) {
			const wpUser = await wpMeResponse.json();
			if ( wpUser.link ) {
				return wpUser.link;
			}
		}
	} catch {
		// Not WordPress.
	}

	return null;
}

/**
 * Discover the outbox URL from an ActivityPub actor.
 */
async function discoverOutboxFromActor(
	actorUrl: string,
	token: string
): Promise< string | null > {
	try {
		const response = await fetch( actorUrl, {
			headers: {
				Accept: 'application/activity+json, application/ld+json',
				Authorization: `Bearer ${ token }`,
			},
		} );

		if ( ! response.ok ) {
			return null;
		}

		const actor = await response.json();
		return actor.outbox || null;
	} catch ( err ) {
		return null;
	}
}

/**
 * Discover the authenticated user's outbox URL.
 * Finds the actor URL first, then fetches the actor profile for the outbox.
 */
async function discoverOutbox( instance: string, token: string ): Promise< string | null > {
	const actorUrl = await discoverActorUrl( instance, token );
	if ( ! actorUrl ) {
		return null;
	}
	return discoverOutboxFromActor( actorUrl, token );
}

/**
 * Build an acct: URI for a target account.
 *
 * For C2S follows we use the acct: URI directly instead of trying to resolve
 * the actor ID via browser-side WebFinger, which fails due to CORS on most
 * Fediverse instances. The user's server resolves the acct: URI server-side.
 */
function getAcctUri( account: FediAccount ): string {
	return `acct:${ account.username }@${ account.instance }`;
}

/**
 * Follow a single account using the ActivityPub C2S protocol.
 * Posts a Follow activity to the user's outbox.
 */
async function followViaC2S(
	outbox: string,
	token: string,
	account: FediAccount
): Promise< void > {
	// Use the acct: URI — the server resolves it via WebFinger server-side.
	const actorId = getAcctUri( account );

	const activity = {
		'@context': 'https://www.w3.org/ns/activitystreams',
		type: 'Follow',
		object: actorId,
	};

	const response = await fetch( outbox, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ token }`,
			'Content-Type': 'application/activity+json',
		},
		body: JSON.stringify( activity ),
	} );

	if ( ! response.ok && response.status !== 201 && response.status !== 202 ) {
		throw new Error( `C2S follow failed: ${ response.status }` );
	}
}

// ── Public API ──

/**
 * Follow a list of accounts.
 *
 * For Mastodon instances: tries the Mastodon API first, falls back to C2S.
 * For ActivityPub OAuth instances: uses C2S directly.
 *
 * Calls onProgress after each account attempt.
 */
export async function followAccounts(
	instance: string,
	token: string,
	accounts: FediAccount[],
	onProgress?: ( result: FollowResult, index: number, total: number ) => void
): Promise< FollowResult[] > {
	const results: FollowResult[] = [];
	const authState = getAuthState();
	const isActivityPub = authState?.authType === 'activitypub';

	// For ActivityPub OAuth instances, discover the outbox upfront.
	let outbox: string | null = null;
	if ( isActivityPub ) {
		outbox = await discoverOutbox( instance, token );
		if ( ! outbox ) {
			// Can't discover outbox — all follows will fail.
			for ( let i = 0; i < accounts.length; i++ ) {
				const result = {
					account: accounts[ i ],
					success: false,
					error: 'Could not discover outbox for C2S follow.',
				};
				results.push( result );
				onProgress?.( result, i, accounts.length );
			}
			return results;
		}
	}

	for ( let i = 0; i < accounts.length; i++ ) {
		const account = accounts[ i ];
		let success = false;
		let error: string | undefined;

		if ( isActivityPub && outbox ) {
			// ActivityPub OAuth: use C2S directly.
			try {
				await followViaC2S( outbox, token, account );
				success = true;
			} catch ( c2sError ) {
				error = c2sError instanceof Error ? c2sError.message : 'C2S follow failed';
			}
		} else {
			// Mastodon: try API first, fall back to C2S.
			try {
				await followViaMastodonApi( instance, token, account );
				success = true;
			} catch ( mastodonError ) {
				// Mastodon API failed — try C2S fallback.
				if ( outbox === null ) {
					outbox = ( await discoverOutbox( instance, token ) ) || '';
				}

				if ( outbox ) {
					try {
						await followViaC2S( outbox, token, account );
						success = true;
					} catch ( c2sError ) {
						error = c2sError instanceof Error ? c2sError.message : 'Follow failed';
					}
				} else {
					error = mastodonError instanceof Error ? mastodonError.message : 'Follow failed';
				}
			}
		}

		const result = { account, success, error };
		results.push( result );
		onProgress?.( result, i, accounts.length );
	}

	return results;
}

/**
 * Follow a single account (convenience wrapper).
 */
export async function followSingleAccount(
	instance: string,
	token: string,
	account: FediAccount
): Promise< FollowResult > {
	const results = await followAccounts( instance, token, [ account ] );
	return results[ 0 ];
}
