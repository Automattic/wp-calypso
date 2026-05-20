import { PENDING_LIKE_URI } from '@automattic/api-core';
import { useCreateLikeMutation, useDeleteLikeMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { createElement } from 'react';
import { useDispatch } from 'react-redux';
import { logToLogstash } from 'calypso/lib/logstash';
import { rkeyFromUri } from 'calypso/reader/social/utils/rkey-from-uri';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from '../social/components/post-card/analytics-context';
import type { LikeAction, UseLikeActionFn } from '../social/components/post-card/like-context';
import type { AtmosphereError } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';

type LikeDirection = 'like' | 'unlike';

function errorMessageForLike(
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
		case 'invalid_credentials':
			return translate( 'Reconnect your Bluesky account to like posts.' );
		case 'rate_limited':
			return translate( "You're liking posts too quickly. Try again in a moment." );
		case 'connection_not_found':
		case 'not_found':
			return translate( 'This connection no longer exists.' );
		case 'bad_request':
		case 'invalid_handle':
		case 'upstream_unavailable':
		case 'text_too_long':
		case 'reply_disabled':
		case 'quote_disabled':
		case 'target_unavailable':
		case 'unknown':
		case 'blob_decode_failed':
			return translate( 'Could not save your like. Please try again.' );
		default:
			// Defensive fallback if AtmosphereError widens before this
			// switch is updated. TypeScript exhaustiveness keeps this
			// branch unreachable today; without it, an empty-toast notice
			// would render via `errorNotice( undefined )` for a kind we
			// haven't classified yet.
			return translate( 'Could not save your like. Please try again.' );
	}
}

/**
 * Factory that produces an atmosphere-protocol like-action hook for a
 * given connection.
 *
 * Usage in panel render:
 *
 *   const useLikeAction = useMemo(
 *     () => makeUseAtmosphereLikeAction( connection.id ),
 *     [ connection.id ]
 *   );
 *   <LikeProvider value={ useLikeAction }>…</LikeProvider>
 *
 * The returned function is itself a custom hook (it calls useCreateLikeMutation
 * etc.), so it must only be called inside a React component.
 */
export function makeUseAtmosphereLikeAction( connectionId: number ): UseLikeActionFn {
	return function useAtmosphereLikeAction( post: SocialPost ): LikeAction {
		const translate = useTranslate();
		const dispatch = useDispatch();
		const analytics = useSocialAnalytics();
		const create = useCreateLikeMutation( connectionId );
		const remove = useDeleteLikeMutation( connectionId );

		const isLiked = Boolean( post.viewer?.like );
		const isPending =
			create.isPending || remove.isPending || post.viewer?.like === PENDING_LIKE_URI;

		const trackError = ( atmosphereError: AtmosphereError, direction: LikeDirection ) => {
			dispatch( errorNotice( errorMessageForLike( atmosphereError, translate ) ) );
			analytics?.onClick( `calypso_reader_${ analytics.source }_like_error_shown`, {
				connection_id: connectionId,
				post_uri: post.uri,
				error_kind: atmosphereError.kind,
				direction,
			} );
			// Pipeline-level log so failures stay observable in dashboards
			// even when no Tracks dashboard is consulted.
			logToLogstash( {
				feature: 'calypso_client',
				message: `Reader ATmosphere ${ direction } mutation failed`,
				severity: 'error',
				extra: {
					type: `reader_atmosphere_${ direction }_mutation_error`,
					connection_id: connectionId,
					post_uri: post.uri,
					error_kind: atmosphereError.kind,
				},
			} );
		};

		const like = () => {
			// Atmosphere requires a strong-ref `cid` for the like record.
			// The post-card-counts gate used to enforce this; now that the
			// gate is provider-presence, guard here instead. Bail silently —
			// rendering the button without a cid is a panel-wiring bug, not
			// a user error.
			if ( ! post.cid ) {
				return;
			}
			analytics?.onClick( `calypso_reader_${ analytics.source }_like_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			create.mutate(
				{ postUri: post.uri, postCid: post.cid },
				{ onError: ( err ) => trackError( err, 'like' ) }
			);
		};

		const unlike = () => {
			const rkey = rkeyFromUri( post.viewer?.like ?? '' );
			if ( ! rkey ) {
				// `viewer.like` is set (button shows pressed) but the URI
				// doesn't yield a valid rkey — either it's the
				// `PENDING_LIKE_URI` sentinel still in flight, or the wire
				// payload is malformed. Surface to the user (otherwise the
				// button stays "liked" forever) and log so dashboards see
				// the rate of stuck-pending vs. malformed-uri.
				dispatch(
					errorNotice(
						translate( "We couldn't undo your like. Please try again in a moment." ) as string
					)
				);
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Atmosphere unlike: rkey not derivable from viewer.like',
					severity: 'warning',
					extra: {
						type: 'reader_atmosphere_unlike_rkey_missing',
						connection_id: connectionId,
						post_uri: post.uri,
						viewer_like: post.viewer?.like ?? null,
					},
				} );
				analytics?.onClick( `calypso_reader_${ analytics.source }_unlike_rkey_missing`, {
					connection_id: connectionId,
					post_uri: post.uri,
				} );
				return;
			}
			analytics?.onClick( `calypso_reader_${ analytics.source }_unlike_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			remove.mutate(
				{ rkey, postUri: post.uri },
				{ onError: ( err ) => trackError( err, 'unlike' ) }
			);
		};

		const accessibleLabel = ( count: number ) =>
			count > 0
				? translate( 'Like, %(count)s like', 'Like, %(count)s likes', {
						count,
						args: { count: formatNumber( count ) },
						textOnly: true,
				  } )
				: translate( 'Like', {
						textOnly: true,
						comment:
							'Accessible label and tooltip for the like button on a Bluesky/ATmosphere post card when the post has no likes yet. Verb.',
				  } );

		const statRowText = ( count: number ) =>
			translate( '{{strong}}%(count)s{{/strong}} like', '{{strong}}%(count)s{{/strong}} likes', {
				count,
				args: { count: formatNumber( count ) },
				components: { strong: createElement( 'strong' ) },
			} );

		return {
			supported: true,
			isLiked,
			isPending,
			label: { accessibleLabel, statRowText },
			like,
			unlike,
		};
	};
}
