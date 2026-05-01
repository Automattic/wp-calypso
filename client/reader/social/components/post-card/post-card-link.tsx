import './style.scss';

import clsx from 'clsx';
import type { ReactNode } from 'react';

interface PostCardLinkProps {
	variant: 'default' | 'compact';
	children: ReactNode;
}

// Card-link wrapper: provides the positioning context for the ::after overlay
// the timestamp anchor in PostCardHeader uses to make the whole card a click
// target. Used by both variants: default cards get the `post_clicked` overlay
// from the timestamp anchor PostCardHeader derives internally, and compact
// cards get an overlay only when the consumer passes `cardLink` to
// SocialPostCard (e.g. PostCardEmbedQuote, which uses it as the quote
// click target).
export function PostCardLink( { variant, children }: PostCardLinkProps ) {
	return (
		<div className={ clsx( 'social-post-card-link', `social-post-card-link--${ variant }` ) }>
			{ children }
		</div>
	);
}
