import './style.scss';

import clsx from 'clsx';
import { useSocialAnalytics } from './analytics-context';
import type { AtmosphereFeedItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface PostCardLinkProps {
	post: AtmosphereFeedItem;
	variant: 'default' | 'compact';
	timestampLabel: string;
	children: ReactNode;
}

export function PostCardLink( { post, variant, timestampLabel, children }: PostCardLinkProps ) {
	const analytics = useSocialAnalytics();
	const handleClick = () => {
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
		} );
	};
	return (
		<div className={ clsx( 'social-post-card-link', `social-post-card-link--${ variant }` ) }>
			{ children }
			<a
				className="social-post-card-link__timestamp"
				href={ post.bluesky_url }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ handleClick }
			>
				<span>{ timestampLabel }</span>
				<span className="social-post-card-link__cue" aria-hidden="true">
					↗
				</span>
			</a>
		</div>
	);
}
