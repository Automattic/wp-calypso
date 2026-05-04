import { PENDING_REPOST_URI } from '@automattic/api-core';
import { useCreateRepostMutation, useDeleteRepostMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
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
		};

		const repost = () => {
			// Atmosphere requires a strong-ref `cid` for the repost record.
			// The post-card-counts gate used to enforce this; now that the
			// gate is provider-presence, guard here instead. Bail silently —
			// rendering the button without a cid is a panel-wiring bug, not
			// a user error.
			if ( ! post.cid ) {
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

		const quote = () => {
			// Slice-7d work — disabled menu item for now. No-op.
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
			canQuote: false, // slice-7d
			repost,
			unrepost,
			quote,
		};
	};
}
