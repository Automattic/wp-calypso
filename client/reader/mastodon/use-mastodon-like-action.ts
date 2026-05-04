import {
	useCreateMastodonLikeMutation,
	useDeleteMastodonLikeMutation,
} from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from '../social/components/post-card/analytics-context';
import type { LikeAction, UseLikeActionFn } from '../social/components/post-card/like-context';
import type { MastodonError } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';

type LikeDirection = 'favourite' | 'unfavourite';

function errorMessageForLike(
	error: MastodonError,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
			return translate( 'Reconnect your Mastodon account to favourite posts.' );
		case 'rate_limited':
			return translate( "You're favouriting posts too quickly. Try again in a moment." );
		case 'connection_not_found':
		case 'not_found':
			return translate( 'This connection no longer exists.' );
		case 'invalid_instance':
		case 'bad_request':
		case 'upstream_unavailable':
		case 'unknown':
			return translate( 'Could not save your favourite. Please try again.' );
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

		const error: { kind: string } | null = create.error ?? remove.error ?? null;

		const trackError = ( mastodonError: MastodonError, direction: LikeDirection ) => {
			dispatch( errorNotice( errorMessageForLike( mastodonError, translate ) ) );
			analytics?.onClick( `calypso_reader_${ analytics.source }_favourite_error_shown`, {
				connection_id: connectionId,
				post_uri: post.uri,
				error_kind: mastodonError.kind,
				direction,
			} );
		};

		const like = () => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_favourite_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			create.mutate(
				{ statusId: post.uri },
				{ onError: ( err ) => trackError( err, 'favourite' ) }
			);
		};

		const unlike = () => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_unfavourite_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			remove.mutate(
				{ statusId: post.uri },
				{ onError: ( err ) => trackError( err, 'unfavourite' ) }
			);
		};

		const accessibleLabel = ( count: number ) =>
			translate( 'Favourite, %(count)s favourite', 'Favourite, %(count)s favourites', {
				count,
				args: { count: formatNumber( count ) },
				textOnly: true,
			} );

		return {
			supported: true,
			isLiked,
			isPending,
			error,
			label: {
				action: translate( 'Favourite' ),
				accessibleLabel,
			},
			like,
			unlike,
		};
	};
}
