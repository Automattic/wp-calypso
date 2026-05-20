import {
	useCreateMastodonLikeMutation,
	useDeleteMastodonLikeMutation,
} from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { logToLogstash } from 'calypso/lib/logstash';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from '../social/components/post-card/analytics-context';
import type { LikeAction, UseLikeActionFn } from '../social/components/post-card/like-context';
import type { MastodonError } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';

type LikeDirection = 'favorite' | 'unfavorite';

function errorMessageForLike(
	error: MastodonError,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
			return translate( 'Reconnect your Mastodon account to favorite posts.' );
		case 'rate_limited':
			return translate( "You're favoriting posts too quickly. Try again in a moment." );
		case 'connection_not_found':
		case 'not_found':
			return translate( 'This connection no longer exists.' );
		case 'invalid_instance':
		case 'bad_request':
		case 'upstream_unavailable':
		case 'unknown':
			return translate( 'Could not save your favorite. Please try again.' );
		default:
			// Defensive fallback if MastodonError widens before this switch
			// is updated. TypeScript exhaustiveness keeps this branch
			// unreachable today; without it, an empty-toast notice would
			// render via `errorNotice( undefined )` for a kind we haven't
			// classified yet.
			return translate( 'Could not save your favorite. Please try again.' );
	}
}

/**
 * Factory that produces a Mastodon-protocol like-action hook for a
 * given connection.
 *
 * Usage in panel render:
 *
 *   const useLikeAction = useMemo(
 *     () => makeUseMastodonLikeAction( connection.id ),
 *     [ connection.id ]
 *   );
 *   <LikeProvider value={ useLikeAction }>…</LikeProvider>
 *
 * The returned function is itself a custom hook (it calls
 * useCreateMastodonLikeMutation etc.), so it must only be called
 * inside a React component.
 */
export function makeUseMastodonLikeAction( connectionId: number ): UseLikeActionFn {
	return function useMastodonLikeAction( post: SocialPost ): LikeAction {
		const translate = useTranslate();
		const dispatch = useDispatch();
		const analytics = useSocialAnalytics();
		const create = useCreateMastodonLikeMutation( connectionId );
		const remove = useDeleteMastodonLikeMutation( connectionId );

		const isLiked = Boolean( post.viewer?.like );
		const isPending = create.isPending || remove.isPending;

		const trackError = ( mastodonError: MastodonError, direction: LikeDirection ) => {
			dispatch( errorNotice( errorMessageForLike( mastodonError, translate ) ) );
			analytics?.onClick( `calypso_reader_${ analytics.source }_favorite_error_shown`, {
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

		const like = () => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_favorite_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			create.mutate(
				{ statusId: post.uri },
				{ onError: ( err ) => trackError( err, 'favorite' ) }
			);
		};

		const unlike = () => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_unfavorite_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			remove.mutate(
				{ statusId: post.uri },
				{ onError: ( err ) => trackError( err, 'unfavorite' ) }
			);
		};

		const accessibleLabel = ( count: number ) =>
			translate( 'Favorite, %(count)s favorite', 'Favorite, %(count)s favorites', {
				count,
				args: { count: formatNumber( count ) },
				textOnly: true,
			} );

		return {
			supported: true,
			isLiked,
			isPending,
			label: { accessibleLabel },
			like,
			unlike,
		};
	};
}
