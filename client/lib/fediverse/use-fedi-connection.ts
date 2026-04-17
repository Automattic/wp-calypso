/**
 * React hook for managing the Fediverse OAuth connection and follow state.
 *
 * Handles:
 * - Checking for OAuth callback codes on mount
 * - Completing the token exchange
 * - Tracking connected instance / token
 * - Running pending follow actions after auth completes
 */

import { useCallback, useEffect, useState } from 'react';
import {
	clearAuthState,
	completeOAuthFlow,
	getActiveConnection,
	getOAuthCallbackCode,
	getOAuthCallbackState,
	cleanOAuthParams,
	startOAuthFlow,
} from './fedi-auth';
import { followAccounts, followSingleAccount } from './fedi-follow';
import type { FollowResult } from './fedi-follow';
import type { FediAccount } from './types';

export interface FediConnectionState {
	/** The connected instance domain, or null if not connected. */
	instance: string | null;
	/** Whether we're currently processing an OAuth callback. */
	isAuthenticating: boolean;
	/** Whether a follow operation is in progress. */
	isFollowing: boolean;
	/** Results from the last follow operation. */
	followResults: FollowResult[];
	/** Progress: [completed, total]. */
	followProgress: [ number, number ];
	/** Error message, if any. */
	error: string | null;
	/** The pending action that triggered auth (for post-redirect resumption). */
	pendingAction: string | null;
}

export interface FediConnectionActions {
	/** Connect to an instance. If already connected, resolves immediately. */
	connect: (
		instance: string,
		packSlug: string,
		action?: 'follow-all' | 'follow-single',
		accountHandle?: string
	) => Promise< void >;
	/** Follow all accounts in a pack. Connects first if needed. */
	followAll: ( instance: string, packSlug: string, accounts: FediAccount[] ) => Promise< void >;
	/** Follow a single account. Connects first if needed. */
	followOne: ( instance: string, packSlug: string, account: FediAccount ) => Promise< void >;
	/** Disconnect and clear stored auth state. */
	disconnect: () => void;
	/** Clear follow results / errors. */
	clearResults: () => void;
}

export default function useFediConnection(): [ FediConnectionState, FediConnectionActions ] {
	const [ state, setState ] = useState< FediConnectionState >( () => {
		const connection = getActiveConnection();
		return {
			instance: connection?.instance || null,
			isAuthenticating: false,
			isFollowing: false,
			followResults: [],
			followProgress: [ 0, 0 ],
			error: null,
			pendingAction: null,
		};
	} );

	// On mount, check for OAuth callback code and complete the flow.
	useEffect( () => {
		const code = getOAuthCallbackCode();
		if ( ! code ) {
			return;
		}

		const returnedState = getOAuthCallbackState();
		cleanOAuthParams();
		setState( ( prev ) => ( { ...prev, isAuthenticating: true, error: null } ) );

		completeOAuthFlow( code, returnedState )
			.then( ( authState ) => {
				setState( ( prev ) => ( {
					...prev,
					instance: authState.instance,
					isAuthenticating: false,
					pendingAction: authState.action || null,
				} ) );
			} )
			.catch( ( err ) => {
				setState( ( prev ) => ( {
					...prev,
					isAuthenticating: false,
					error: err instanceof Error ? err.message : 'Authentication failed',
				} ) );
			} );
	}, [] );

	const connect = useCallback(
		async (
			instance: string,
			packSlug: string,
			action: 'follow-all' | 'follow-single' = 'follow-all',
			accountHandle?: string
		) => {
			setState( ( prev ) => ( { ...prev, error: null } ) );

			try {
				// startOAuthFlow will redirect if no token exists,
				// or return immediately if already connected.
				await startOAuthFlow( instance, packSlug, action, accountHandle );

				// If we get here, we're already connected (no redirect happened).
				const connection = getActiveConnection();
				if ( connection ) {
					setState( ( prev ) => ( { ...prev, instance: connection.instance } ) );
				}
			} catch ( err ) {
				setState( ( prev ) => ( {
					...prev,
					error: err instanceof Error ? err.message : 'Connection failed',
				} ) );
			}
		},
		[]
	);

	const doFollow = useCallback( async ( accounts: FediAccount[] ) => {
		const connection = getActiveConnection();
		if ( ! connection?.accessToken ) {
			setState( ( prev ) => ( {
				...prev,
				error: 'Not connected. Please connect to your instance first.',
			} ) );
			return;
		}

		setState( ( prev ) => ( {
			...prev,
			isFollowing: true,
			followResults: [],
			followProgress: [ 0, accounts.length ],
			error: null,
		} ) );

		try {
			const results = await followAccounts(
				connection.instance,
				connection.accessToken,
				accounts,
				( _result, index, total ) => {
					setState( ( prev ) => ( {
						...prev,
						followProgress: [ index + 1, total ],
					} ) );
				}
			);

			setState( ( prev ) => ( {
				...prev,
				isFollowing: false,
				followResults: results,
				pendingAction: null,
			} ) );
		} catch ( err ) {
			setState( ( prev ) => ( {
				...prev,
				isFollowing: false,
				error: err instanceof Error ? err.message : 'Follow failed',
				pendingAction: null,
			} ) );
		}
	}, [] );

	const followAll = useCallback(
		async ( instance: string, packSlug: string, accounts: FediAccount[] ) => {
			const connection = getActiveConnection();
			if ( connection?.accessToken && connection.instance === instance ) {
				return doFollow( accounts );
			}
			// Not connected yet — start OAuth flow. After redirect, the pending action
			// will be picked up by the consuming component.
			return connect( instance, packSlug, 'follow-all' );
		},
		[ connect, doFollow ]
	);

	const followOne = useCallback(
		async ( instance: string, packSlug: string, account: FediAccount ) => {
			const connection = getActiveConnection();
			if ( connection?.accessToken && connection.instance === instance ) {
				setState( ( prev ) => ( {
					...prev,
					isFollowing: true,
					error: null,
				} ) );

				try {
					const result = await followSingleAccount(
						connection.instance,
						connection.accessToken,
						account
					);
					setState( ( prev ) => ( {
						...prev,
						isFollowing: false,
						followResults: [ ...prev.followResults, result ],
					} ) );
				} catch ( err ) {
					setState( ( prev ) => ( {
						...prev,
						isFollowing: false,
						error: err instanceof Error ? err.message : 'Follow failed',
					} ) );
				}
				return;
			}
			const handle = `${ account.username }@${ account.instance }`;
			return connect( instance, packSlug, 'follow-single', handle );
		},
		[ connect ]
	);

	const disconnect = useCallback( () => {
		clearAuthState();
		setState( {
			instance: null,
			isAuthenticating: false,
			isFollowing: false,
			followResults: [],
			followProgress: [ 0, 0 ],
			error: null,
			pendingAction: null,
		} );
	}, [] );

	const clearResults = useCallback( () => {
		setState( ( prev ) => ( { ...prev, followResults: [], error: null } ) );
	}, [] );

	return [ state, { connect, followAll, followOne, disconnect, clearResults } ];
}
