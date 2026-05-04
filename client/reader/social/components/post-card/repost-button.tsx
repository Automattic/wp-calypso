import { PENDING_REPOST_URI } from '@automattic/api-core';
import { useCreateRepostMutation, useDeleteRepostMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderRepostIcon from 'calypso/reader/components/icons/repost';
import { rkeyFromUri } from 'calypso/reader/social/utils/rkey-from-uri';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from './analytics-context';
import type { AtmosphereError, AtmosphereFeedItem } from '@automattic/api-core';

import './repost-button.scss';

interface RepostButtonProps {
	post: Pick< AtmosphereFeedItem, 'uri' | 'cid' | 'counts' | 'viewer' >;
	connectionId: number;
	/**
	 * When set, the "Quote post" menu item becomes active and invokes this
	 * callback. The host (`<PostCardCounts>`) closes over the full `SocialPost`
	 * so the composer's preview has every field it needs (author, html, embed,
	 * counts) — `<RepostButton>` only carries the minimal `Pick` required for
	 * its own mutations.
	 */
	onQuote?: () => void;
}

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
	}
}

export function RepostButton( { post, connectionId, onQuote }: RepostButtonProps ) {
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
	const formattedReposts = formatNumber( post.counts.reposts );
	const accessibleLabel = isReposted
		? translate( 'Undo repost, %(count)s repost', 'Undo repost, %(count)s reposts', {
				count: post.counts.reposts,
				args: { count: formattedReposts },
				textOnly: true,
		  } )
		: translate( 'Repost, %(count)s repost', 'Repost, %(count)s reposts', {
				count: post.counts.reposts,
				args: { count: formattedReposts },
				textOnly: true,
		  } );

	const trackError = ( error: AtmosphereError, direction: RepostDirection ) => {
		dispatch( errorNotice( errorMessageForRepost( error, translate ) ) );
		analytics?.onClick( `calypso_reader_${ analytics.source }_repost_error_shown`, {
			connection_id: connectionId,
			post_uri: post.uri,
			error_kind: error.kind,
			direction,
		} );
	};

	const handleRepost = () => {
		analytics?.onClick( `calypso_reader_${ analytics.source }_repost_clicked`, {
			connection_id: connectionId,
			post_uri: post.uri,
		} );
		create.mutate(
			{ postUri: post.uri, postCid: post.cid },
			{ onError: ( error ) => trackError( error, 'repost' ) }
		);
	};

	const handleUnrepost = () => {
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
			{ onError: ( error ) => trackError( error, 'unrepost' ) }
		);
	};

	if ( isReposted ) {
		return (
			<button
				type="button"
				className={ clsx( 'social-post-card-repost-button', {
					'is-reposted': true,
					'is-pending': isPending,
				} ) }
				aria-pressed
				aria-label={ accessibleLabel }
				disabled={ isPending }
				onClick={ ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					if ( isPending ) {
						return;
					}
					handleUnrepost();
				} }
			>
				<ReaderRepostIcon iconSize={ 16 } />
				<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
			</button>
		);
	}

	return (
		<Dropdown
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button
					type="button"
					className={ clsx( 'social-post-card-repost-button', { 'is-pending': isPending } ) }
					aria-haspopup="menu"
					aria-expanded={ isOpen }
					aria-label={ accessibleLabel }
					disabled={ isPending }
					onClick={ ( event ) => {
						event.preventDefault();
						event.stopPropagation();
						if ( isPending ) {
							return;
						}
						onToggle();
					} }
				>
					<ReaderRepostIcon iconSize={ 16 } />
					<span className="social-post-card-repost-button__count">{ formattedReposts }</span>
				</button>
			) }
			renderContent={ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						onClick={ () => {
							onClose();
							handleRepost();
						} }
					>
						{ translate( 'Repost' ) }
					</MenuItem>
					<MenuItem
						disabled={ ! onQuote }
						onClick={ () => {
							onClose();
							onQuote?.();
						} }
					>
						{ translate( 'Quote post' ) }
					</MenuItem>
				</MenuGroup>
			) }
		/>
	);
}
