import { TimeSince } from '@automattic/components';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSocialAnalytics } from './analytics-context';
import type { SocialPost } from '../../types';
import type React from 'react';
import type { ReactNode } from 'react';

interface PostCardHeaderProps {
	post: SocialPost;
	variant: 'default' | 'compact';
	prominentTimestamp?: boolean;
	timestampLink?: {
		href: string;
		onClick?: ( event: React.MouseEvent< HTMLAnchorElement > ) => void;
		target?: string;
		rel?: string;
		ariaLabel?: string;
	};
}

export function PostCardHeader( {
	post,
	variant,
	prominentTimestamp,
	timestampLink,
}: PostCardHeaderProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const isCompact = variant === 'compact';
	const displayName = post.author.display_name || post.author.handle;
	const externalProfileUrl = post.author.profile_url;
	const inAppProfileUrl =
		analytics?.getProfileUrl?.( {
			id: post.author.id,
			did: post.author.id,
			handle: post.author.handle,
		} ) ?? null;
	const profileUrl = inAppProfileUrl ?? externalProfileUrl;
	const profileTarget = inAppProfileUrl ? undefined : '_blank';
	const profileRel = inAppProfileUrl ? undefined : 'noopener noreferrer';
	const profileDestination = inAppProfileUrl ? 'in_app' : 'bsky_app';
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
			author_id: post.author.id,
			author_handle: post.author.handle,
			destination: profileDestination,
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
		if ( isCompact ) {
			if ( timestampLink ) {
				return (
					<a
						className="social-post-card-header__timestamp"
						href={ timestampLink.href }
						target={ timestampLink.target }
						rel={ timestampLink.rel }
						aria-label={ timestampLink.ariaLabel }
						onClick={ timestampLink.onClick }
					>
						{ timestampIso ? (
							<TimeSince date={ timestampIso } />
						) : (
							<span className="screen-reader-text">
								{ timestampLink.ariaLabel || translate( 'Open quoted post' ) }
							</span>
						) }
					</a>
				);
			}
			if ( ! timestampIso ) {
				return null;
			}
			return <TimeSince className="social-post-card-header__timestamp" date={ timestampIso } />;
		}
		if ( ! timestampIso ) {
			return null;
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
				href={ post.permalink }
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
					{ ( () => {
						const by = post.reason.by;
						const reposterName = by.display_name || by.handle;
						const inAppUrl =
							analytics?.getProfileUrl?.( {
								id: by.id,
								did: by.id,
								handle: by.handle,
							} ) ?? null;
						const href =
							inAppUrl ?? `https://bsky.app/profile/${ encodeURIComponent( by.handle ) }`;
						const isInApp = inAppUrl !== null;
						const target = isInApp ? undefined : '_blank';
						const rel = isInApp ? undefined : 'noopener noreferrer';
						const destination = isInApp ? 'in_app' : 'bsky_app';
						const fireRepostAuthorClicked = () => {
							if ( ! analytics ) {
								return;
							}
							analytics.onClick(
								`calypso_reader_${ analytics.source }_timeline_repost_author_clicked`,
								{
									connection_id: analytics.connectionId,
									post_uri: post.uri,
									reposter_did: by.id,
									reposter_handle: by.handle,
									destination,
								}
							);
						};
						return translate( 'Reposted by {{a}}%(name)s{{/a}}', {
							args: { name: reposterName },
							components: {
								a: (
									<a
										className="social-post-card-header__reason-author"
										href={ href }
										target={ target }
										rel={ rel }
										onClick={ fireRepostAuthorClicked }
									/>
								),
							},
						} );
					} )() }
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
						target={ profileTarget }
						rel={ profileRel }
						onClick={ fireAuthorClicked }
					>
						{ authorBody }
					</a>
				) }
				{ ! prominentTimestamp && ( timestampIso || ( isCompact && timestampLink ) ) && (
					<>
						{ timestampIso && (
							<span className="social-post-card-header__dot" aria-hidden="true">
								·
							</span>
						) }
						{ renderTimestamp() }
					</>
				) }
			</div>
		</VStack>
	);
}
