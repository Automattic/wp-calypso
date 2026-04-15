/**
 * Hook for subscribing to feeds in the WordPress.com Reader.
 *
 * Uses the REST API: POST /read/following/mine/new { url }
 * Requires the user to be logged into WordPress.com.
 */

import { useCallback, useState } from 'react';
import wp from 'calypso/lib/wp';
import type { FediAccount } from '../data/packs';

export interface ReaderFollowResult {
	account: FediAccount;
	success: boolean;
	error?: string;
}

export interface UseReaderFollowReturn {
	isFollowing: boolean;
	followResults: ReaderFollowResult[];
	followProgress: [ number, number ];
	error: string | null;
	followAllInReader: ( accounts: FediAccount[] ) => Promise< void >;
	followOneInReader: ( account: FediAccount ) => Promise< ReaderFollowResult >;
	clearResults: () => void;
}

/**
 * Subscribe to a single feed URL via the WordPress.com Reader API.
 */
async function subscribeToFeed( feedUrl: string ): Promise< boolean > {
	const response = await wp.req.post(
		'/read/following/mine/new',
		{ apiVersion: '1.1' },
		{ url: feedUrl, source: 'starter-packs' }
	);
	return !! response?.subscribed;
}

export default function useReaderFollow(): UseReaderFollowReturn {
	const [ isFollowing, setIsFollowing ] = useState( false );
	const [ followResults, setFollowResults ] = useState< ReaderFollowResult[] >( [] );
	const [ followProgress, setFollowProgress ] = useState< [ number, number ] >( [ 0, 0 ] );
	const [ error, setError ] = useState< string | null >( null );

	const followOneInReader = useCallback( async ( account: FediAccount ) => {
		if ( ! account.feedUrl ) {
			const result: ReaderFollowResult = {
				account,
				success: false,
				error: 'No feed URL available',
			};
			setFollowResults( ( prev ) => [ ...prev, result ] );
			return result;
		}

		setIsFollowing( true );
		setError( null );

		try {
			const success = await subscribeToFeed( account.feedUrl );
			const result: ReaderFollowResult = { account, success };
			if ( ! success ) {
				result.error = 'Subscription was not confirmed';
			}
			setFollowResults( ( prev ) => [ ...prev, result ] );
			setIsFollowing( false );
			return result;
		} catch ( err ) {
			const result: ReaderFollowResult = {
				account,
				success: false,
				error: err instanceof Error ? err.message : 'Subscription failed',
			};
			setFollowResults( ( prev ) => [ ...prev, result ] );
			setIsFollowing( false );
			return result;
		}
	}, [] );

	const followAllInReader = useCallback( async ( accounts: FediAccount[] ) => {
		const feedAccounts = accounts.filter( ( a ) => a.feedUrl );
		if ( feedAccounts.length === 0 ) {
			setError( 'No feed URLs available for these accounts.' );
			return;
		}

		setIsFollowing( true );
		setFollowResults( [] );
		setFollowProgress( [ 0, feedAccounts.length ] );
		setError( null );

		const results: ReaderFollowResult[] = [];

		for ( let i = 0; i < feedAccounts.length; i++ ) {
			const account = feedAccounts[ i ];
			try {
				const success = await subscribeToFeed( account.feedUrl! );
				results.push( { account, success } );
			} catch ( err ) {
				results.push( {
					account,
					success: false,
					error: err instanceof Error ? err.message : 'Failed',
				} );
			}
			setFollowProgress( [ i + 1, feedAccounts.length ] );
			setFollowResults( [ ...results ] );
		}

		setIsFollowing( false );
	}, [] );

	const clearResults = useCallback( () => {
		setFollowResults( [] );
		setError( null );
	}, [] );

	return {
		isFollowing,
		followResults,
		followProgress,
		error,
		followAllInReader,
		followOneInReader,
		clearResults,
	};
}
