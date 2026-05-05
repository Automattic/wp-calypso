import { PENDING_REPOST_URI } from '@automattic/api-core';
import { useCreateRepostMutation, useDeleteRepostMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { logToLogstash } from 'calypso/lib/logstash';
import { rkeyFromUri } from 'calypso/reader/social/utils/rkey-from-uri';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from '../social/components/post-card/analytics-context';
import type {
	RepostAction,
	UseRepostActionFn,
} from '../social/components/post-card/repost-context';
import type { AtmosphereError } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';

type RepostDirection = 'repost' | 'unrepost';

function errorMessageForRepost(
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
		case 'invalid_credentials':
			return translate( 'Reconnect your Bluesky account to repost.' );
		case 'rate_limited':
			return translate( "You're reposting too quickly. Try again in a moment." );
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
			return translate( 'Could not save your repost. Please try again.' );
		default:
			// Defensive fallback if the AtmosphereError union widens before
			// this switch is updated. TypeScript exhaustiveness keeps this
			// branch unreachable today; without it, an empty-toast notice
			// would render via `errorNotice( undefined )` for a kind we
			// haven't classified yet.
			return translate( 'Could not save your repost. Please try again.' );
	}
}

/**
 * Factory that produces an atmosphere-protocol repost-action hook for a
 * given connection.
 *
 * Usage in panel render:
 *
 *   const useRepostAction = useMemo(
 *     () => makeUseAtmosphereRepostAction( connection.id ),
 *     [ connection.id ]
 *   );
 *   <RepostProvider value={ useRepostAction }>…</RepostProvider>
 *
 * The returned function is itself a custom hook (it calls useCreateRepostMutation
 * etc.), so it must only be called inside a React component.
 */
export function makeUseAtmosphereRepostAction( connectionId: number ): UseRepostActionFn {
	return function useAtmosphereRepostAction( post: SocialPost ): RepostAction {
		const translate = useTranslate();
		const dispatch = useDispatch();
		const analytics = useSocialAnalytics();
		const create = useCreateRepostMutation( connectionId );
		const remove = useDeleteRepostMutation( connectionId );

		const isReposted = Boolean( post.viewer?.repost );
		// Disable across every instance of this post while a create-repost is in
		// flight: cache carries `PENDING_REPOST_URI` even on instances whose own
		// mutation hooks aren't pending, so a user who clicks the repost button on
		// a duplicate render (e.g. timeline + thread) would otherwise either fire
		// a duplicate create or hit a dead rkey on un-repost and silently no-op.
		const isPending =
			create.isPending || remove.isPending || post.viewer?.repost === PENDING_REPOST_URI;

		const trackError = ( atmosphereError: AtmosphereError, direction: RepostDirection ) => {
			dispatch( errorNotice( errorMessageForRepost( atmosphereError, translate ) ) );
			analytics?.onClick( `calypso_reader_${ analytics.source }_repost_error_shown`, {
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

		const repost = () => {
			// Atmosphere requires a strong-ref `cid` for the repost record.
			// The post-card-counts gate used to enforce this; now that the
			// gate is provider-presence, guard here. Rendering the button
			// without a cid is a panel-wiring bug, not a user error — but
			// log it so it's observable in dashboards rather than dead-button
			// silently in production.
			if ( ! post.cid ) {
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Atmosphere repost: post.cid missing on click',
					severity: 'warning',
					extra: {
						type: 'reader_atmosphere_repost_missing_cid',
						connection_id: connectionId,
						post_uri: post.uri,
					},
				} );
				analytics?.onClick( `calypso_reader_${ analytics.source }_repost_missing_cid`, {
					connection_id: connectionId,
					post_uri: post.uri,
				} );
				return;
			}
			analytics?.onClick( `calypso_reader_${ analytics.source }_repost_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			create.mutate(
				{ postUri: post.uri, postCid: post.cid },
				{ onError: ( err ) => trackError( err, 'repost' ) }
			);
		};

		const unrepost = () => {
			const rkey = rkeyFromUri( post.viewer?.repost ?? '' );
			if ( ! rkey ) {
				// `viewer.repost` is set (button shows pressed) but the URI
				// doesn't yield a valid rkey — either it's the
				// `PENDING_REPOST_URI` sentinel still in flight, or the wire
				// payload is malformed. Surface to the user (otherwise the
				// button stays "reposted" forever) and log so dashboards see
				// the rate of stuck-pending vs. malformed-uri.
				dispatch(
					errorNotice(
						translate( "We couldn't undo your repost. Please try again in a moment." ) as string
					)
				);
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Atmosphere unrepost: rkey not derivable from viewer.repost',
					severity: 'warning',
					extra: {
						type: 'reader_atmosphere_unrepost_rkey_missing',
						connection_id: connectionId,
						post_uri: post.uri,
						viewer_repost: post.viewer?.repost ?? null,
					},
				} );
				analytics?.onClick( `calypso_reader_${ analytics.source }_unrepost_rkey_missing`, {
					connection_id: connectionId,
					post_uri: post.uri,
				} );
				return;
			}
			analytics?.onClick( `calypso_reader_${ analytics.source }_unrepost_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			remove.mutate(
				{ rkey, postUri: post.uri },
				{ onError: ( err ) => trackError( err, 'unrepost' ) }
			);
		};

		// Composer-driven quote handler is provided by the panel via the
		// analytics context (`onQuoteClick`). The menu item is only active
		// when the panel has wired the composer AND the post carries the
		// `cid` strong-ref the composer needs to mint an AT-Proto quote.
		const onQuoteClick = analytics?.onQuoteClick;
		const canQuote = Boolean( post.cid && onQuoteClick );

		const quote = () => {
			if ( ! canQuote || ! onQuoteClick ) {
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
				? translate( 'Undo repost, %(count)s repost', 'Undo repost, %(count)s reposts', {
						count,
						args: { count: formatted },
						textOnly: true,
				  } )
				: translate( 'Repost, %(count)s repost', 'Repost, %(count)s reposts', {
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
				action: translate( 'Repost' ),
				accessibleLabel,
			},
			canQuote,
			repost,
			unrepost,
			quote,
		};
	};
}
