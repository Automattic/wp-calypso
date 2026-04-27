import './style.scss';

import clsx from 'clsx';
import type { ReactNode } from 'react';

interface PostCardLinkProps {
	variant: 'default' | 'compact';
	children: ReactNode;
}

// Card-link wrapper: provides the positioning context for the ::after overlay
// the timestamp anchor in PostCardHeader uses to make the whole card a click
// target for `post_clicked`. Compact mode is rendered without this wrapper —
// see SocialPostCard.
export function PostCardLink( { variant, children }: PostCardLinkProps ) {
	return (
		<div className={ clsx( 'social-post-card-link', `social-post-card-link--${ variant }` ) }>
			{ children }
		</div>
	);
}
