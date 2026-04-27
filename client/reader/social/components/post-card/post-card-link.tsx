import './style.scss';

import clsx from 'clsx';
import type { AtmosphereFeedItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface PostCardLinkProps {
	post: AtmosphereFeedItem;
	variant: 'default' | 'compact';
	timestampLabel: string;
	children: ReactNode;
}

export function PostCardLink( { post, variant, timestampLabel, children }: PostCardLinkProps ) {
	return (
		<div className={ clsx( 'social-post-card-link', `social-post-card-link--${ variant }` ) }>
			{ children }
			<a
				className="social-post-card-link__timestamp"
				href={ post.bluesky_url }
				target="_blank"
				rel="noopener noreferrer"
			>
				<span>{ timestampLabel }</span>
				<span className="social-post-card-link__cue" aria-hidden="true">
					↗
				</span>
			</a>
		</div>
	);
}
