import {
	useCreateMastodonRepostMutation,
	useDeleteMastodonRepostMutation,
} from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { logToLogstash } from 'calypso/lib/logstash';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from '../social/components/post-card/analytics-context';
import type {
	RepostAction,
	UseRepostActionFn,
} from '../social/components/post-card/repost-context';
import type { MastodonError } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';

type BoostDirection = 'boost' | 'unboost';

function errorMessageForBoost(
	error: MastodonError,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
			return translate( 'Reconnect your Mastodon account to boost posts.' );
		case 'rate_limited':
			return translate( "You're boosting posts too quickly. Try again in a moment." );
		case 'connection_not_found':
		case 'not_found':
			return translate( 'This connection no longer exists.' );
		case 'invalid_instance':
		case 'bad_request':
		case 'upstream_unavailable':
		case 'unknown':
			return translate( 'Could not save your boost. Please try again.' );
		default:
			// Defensive fallback if the MastodonError union widens before
			// this switch is updated. TypeScript exhaustiveness keeps this
			// branch unreachable today; without it, an empty-toast notice
			// would render via `errorNotice( undefined )` for a kind we
			// haven't classified yet.
			return translate( 'Could not save your boost. Please try again.' );
	}
}

/**
 * Factory that produces a Mastodon-protocol repost-action hook for a
 * given connection.
 *
 * Usage in panel render:
 *
 *   const useRepostAction = useMemo(
 *     () => makeUseMastodonRepostAction( connection.id ),
 *     [ connection.id ]
 *   );
 *   <RepostProvider value={ useRepostAction }>…</RepostProvider>
 *
 * The returned function is itself a custom hook (it calls
 * useCreateMastodonRepostMutation etc.), so it must only be called
 * inside a React component.
 *
 * Mastodon has no native quote-post API; `quote()` implements it as a
 * text post that appends the original's permalink (see `buildParamsForMode`
 * in composer-config.tsx). `canQuote` is true when the composer is mounted
 * upstream (signalled by `analytics.onQuoteClick` being set).
 */
export function makeUseMastodonRepostAction( connectionId: number ): UseRepostActionFn {
	return function useMastodonRepostAction( post: SocialPost ): RepostAction {
		const translate = useTranslate();
		const dispatch = useDispatch();
		const analytics = useSocialAnalytics();
		const create = useCreateMastodonRepostMutation( connectionId );
		const remove = useDeleteMastodonRepostMutation( connectionId );

		// `post.viewer?.repost` is 'reblogged' (truthy) when the Mastodon mapper
		// has translated viewer.reblogged: true → viewer.repost: 'reblogged'.
		const isReposted = Boolean( post.viewer?.repost );
		const isPending = create.isPending || remove.isPending;

		const trackError = ( mastodonError: MastodonError, direction: BoostDirection ) => {
			dispatch( errorNotice( errorMessageForBoost( mastodonError, translate ) ) );
			analytics?.onClick( `calypso_reader_${ analytics.source }_boost_error_shown`, {
				connection_id: connectionId,
				post_uri: post.uri,
				error_kind: mastodonError.kind,
				direction,
			} );
			// Pipeline-level log so failures stay observable in dashboards
			// even when no Tracks dashboard is consulted.
			logToLogstash( {
				feature: 'calypso_client',
				message: `Reader Mastodon ${ direction } mutation failed`,
				severity: 'error',
				extra: {
					type: `reader_mastodon_${ direction }_mutation_error`,
					connection_id: connectionId,
					status_id: post.uri,
					error_kind: mastodonError.kind,
				},
			} );
		};

		const repost = () => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_boost_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			create.mutate( { statusId: post.uri }, { onError: ( err ) => trackError( err, 'boost' ) } );
		};

		const unrepost = () => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_unboost_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			remove.mutate( { statusId: post.uri }, { onError: ( err ) => trackError( err, 'unboost' ) } );
		};

		const onQuoteClick = analytics?.onQuoteClick;

		const quote = () => {
			if ( ! onQuoteClick ) {
				return;
			}
			analytics?.onClick( `calypso_reader_${ analytics.source }_quote_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			onQuoteClick( post );
		};

		const accessibleLabel = ( count: number, reposted: boolean ) => {
			const formatted = formatNumber( count );
			return reposted
				? translate( 'Undo boost, %(count)s boost', 'Undo boost, %(count)s boosts', {
						count,
						args: { count: formatted },
						textOnly: true,
				  } )
				: translate( 'Boost, %(count)s boost', 'Boost, %(count)s boosts', {
						count,
						args: { count: formatted },
						textOnly: true,
				  } );
		};

		return {
			supported: true,
			isReposted,
			isPending,
			label: {
				action: translate( 'Boost' ),
				accessibleLabel,
			},
			canQuote: Boolean( onQuoteClick ),
			repost,
			unrepost,
			quote,
		};
	};
}
