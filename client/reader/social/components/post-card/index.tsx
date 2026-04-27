import './style.scss';

import { Card, CardBody } from '@wordpress/components';
import clsx from 'clsx';
import { PostCardBody } from './post-card-body';
import { PostCardCounts } from './post-card-counts';
import { PostCardEmbed } from './post-card-embed';
import { PostCardHeader } from './post-card-header';
import { PostCardLink } from './post-card-link';
import type { AtmosphereFeedItem } from '@automattic/api-core';

type SocialPostCardVariant = 'default' | 'compact';

interface SocialPostCardProps {
	post: AtmosphereFeedItem;
	variant?: SocialPostCardVariant;
}

export function SocialPostCard( { post, variant = 'default' }: SocialPostCardProps ) {
	const isCompact = variant === 'compact';

	const card = (
		<Card className={ clsx( 'social-post-card', `social-post-card--${ variant }` ) }>
			<CardBody>
				<PostCardHeader post={ post } variant={ variant } />
				<PostCardBody post={ post } />
				{ ! isCompact && post.embed && (
					<PostCardEmbed embed={ post.embed } parentPostUri={ post.uri } />
				) }
				{ ! isCompact && <PostCardCounts counts={ post.counts } /> }
			</CardBody>
		</Card>
	);

	// Compact mode renders without any anchors so the consumer
	// (e.g. PostCardEmbedQuote) can wrap it in its own outer anchor without
	// creating invalid nested-<a> markup.
	if ( isCompact ) {
		return card;
	}

	return <PostCardLink variant={ variant }>{ card }</PostCardLink>;
}
