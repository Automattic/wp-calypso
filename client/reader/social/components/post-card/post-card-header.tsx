import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { AtmosphereFeedItem } from '@automattic/api-core';

interface PostCardHeaderProps {
	post: AtmosphereFeedItem;
	variant: 'default' | 'compact';
}

export function PostCardHeader( { post, variant }: PostCardHeaderProps ) {
	const translate = useTranslate();
	const displayName = post.author.display_name || post.author.handle;
	const profileUrl = `https://bsky.app/profile/${ post.author.handle }`;
	const avatarSize = variant === 'compact' ? 24 : 40;

	return (
		<VStack spacing={ 1 } className="social-post-card-header">
			{ post.reason && post.reason.type === 'repost' && (
				<div className="social-post-card-header__reason">
					{ translate( '🔁 Reposted by %(name)s', {
						args: { name: post.reason.by.display_name || post.reason.by.handle },
					} ) }
				</div>
			) }
			{ post.reply_parent && (
				<div className="social-post-card-header__reply-context">
					{ translate( '↩ Replying to @%(handle)s', {
						args: { handle: post.reply_parent.author.handle },
					} ) }
				</div>
			) }
			<HStack alignment="center" spacing={ 2 } justify="flex-start">
				<a
					className="social-post-card-header__author"
					href={ profileUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ post.author.avatar ? (
						<img
							src={ post.author.avatar }
							alt={ post.author.handle }
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
					) }
					<VStack spacing={ 0 }>
						<span className="social-post-card-header__display-name">{ displayName }</span>
						<span className="social-post-card-header__handle">@{ post.author.handle }</span>
					</VStack>
				</a>
			</HStack>
		</VStack>
	);
}
