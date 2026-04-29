import { TimeSince } from '@automattic/components';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSocialAnalytics } from './analytics-context';
import type { AtmosphereFeedItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface PostCardHeaderProps {
	post: AtmosphereFeedItem;
	variant: 'default' | 'compact';
	prominentTimestamp?: boolean;
}

export function PostCardHeader( { post, variant, prominentTimestamp }: PostCardHeaderProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const isCompact = variant === 'compact';
	const displayName = post.author.display_name || post.author.handle;
	const profileUrl = `https://bsky.app/profile/${ post.author.handle }`;
	const avatarSize = isCompact ? 24 : 36;
	const timestampIso = post.created_at || post.indexed_at;

	const inAppPostUrl = analytics?.getThreadUrl?.( post.uri ) ?? null;
	const inAppParentUrl = post.reply_parent
		? analytics?.getThreadUrl?.( post.reply_parent.uri ) ?? null
		: null;

	const fireAuthorClicked = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_author_clicked`, {
			connection_id: analytics.connectionId,
			author_did: post.author.did,
			author_handle: post.author.handle,
			destination: 'bsky_app',
		} );
	};

	const firePostClicked = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_post_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: post.uri,
			has_embed: post.embed !== null,
			embed_type: post.embed?.type ?? null,
			is_repost: post.reason !== null,
			is_reply: post.reply_parent !== null,
			destination: inAppPostUrl ? 'in_app_thread' : 'bsky_app',
		} );
	};

	const fireReplyContextClicked = () => {
		if ( ! analytics || ! post.reply_parent ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_reply_context_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: post.uri,
			parent_uri: post.reply_parent.uri,
			destination: inAppParentUrl ? 'in_app_thread' : 'bsky_app',
		} );
	};

	const avatarEl: ReactNode = post.author.avatar ? (
		<img
			src={ post.author.avatar }
			alt=""
			width={ avatarSize }
			height={ avatarSize }
			loading="lazy"
			className="social-post-card-header__avatar"
		/>
	) : (
		<div
			className="social-post-card-header__avatar social-post-card-header__avatar--placeholder"
			style={ { width: avatarSize, height: avatarSize } }
			aria-hidden="true"
		/>
	);

	const authorBody: ReactNode = (
		<>
			{ avatarEl }
			<span className="social-post-card-header__author-text">
				<span className="social-post-card-header__display-name">{ displayName }</span>
				<span className="social-post-card-header__handle">@{ post.author.handle }</span>
			</span>
		</>
	);

	const replyContextLabel = post.reply_parent
		? translate( 'Replying to @%(handle)s', {
				args: { handle: post.reply_parent.author.handle },
		  } )
		: null;

	const renderTimestamp = () => {
		if ( ! timestampIso ) {
			return null;
		}
		if ( isCompact ) {
			return <TimeSince className="social-post-card-header__timestamp" date={ timestampIso } />;
		}
		if ( inAppPostUrl ) {
			return (
				<a
					className="social-post-card-header__timestamp"
					href={ inAppPostUrl }
					onClick={ firePostClicked }
				>
					<TimeSince date={ timestampIso } />
				</a>
			);
		}
		return (
			<a
				className="social-post-card-header__timestamp"
				href={ post.bluesky_url }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ firePostClicked }
			>
				<TimeSince date={ timestampIso } />
			</a>
		);
	};

	return (
		<VStack spacing={ 1 } className="social-post-card-header">
			{ post.reason && post.reason.type === 'repost' && (
				<div className="social-post-card-header__reason">
					<span aria-hidden="true">🔁 </span>
					{ translate( 'Reposted by %(name)s', {
						args: { name: post.reason.by.display_name || post.reason.by.handle },
					} ) }
				</div>
			) }
			{ post.reply_parent && replyContextLabel && (
				<div className="social-post-card-header__reply-context">
					<span aria-hidden="true">↩ </span>
					{ inAppParentUrl ? (
						<a
							className="social-post-card-header__reply-context-link"
							href={ inAppParentUrl }
							onClick={ fireReplyContextClicked }
						>
							{ replyContextLabel }
						</a>
					) : (
						replyContextLabel
					) }
				</div>
			) }
			<div className="social-post-card-header__row">
				{ isCompact ? (
					<div className="social-post-card-header__author social-post-card-header__author--inert">
						{ authorBody }
					</div>
				) : (
					<a
						className="social-post-card-header__author"
						href={ profileUrl }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ fireAuthorClicked }
					>
						{ authorBody }
					</a>
				) }
				{ timestampIso && ! prominentTimestamp && (
					<>
						<span className="social-post-card-header__dot" aria-hidden="true">
							·
						</span>
						{ renderTimestamp() }
					</>
				) }
			</div>
		</VStack>
	);
}
