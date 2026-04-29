import './style.scss';

import { Card, CardBody } from '@wordpress/components';
import clsx from 'clsx';
import { PostCardBody } from './post-card-body';
import { PostCardCounts } from './post-card-counts';
import { PostCardEmbed } from './post-card-embed';
import { PostCardHeader } from './post-card-header';
import { PostCardLink } from './post-card-link';
import { PostCardTimestamp } from './post-card-timestamp';
import type { AtmosphereFeedItem } from '@automattic/api-core';

type SocialPostCardVariant = 'default' | 'compact';

interface SocialPostCardProps {
	post: AtmosphereFeedItem;
	variant?: SocialPostCardVariant;
	expandedVideo?: boolean;
	// When true, the inline timestamp moves out of the header and renders as
	// a standalone block between the embed and the counts row (matches
	// bsky.app's single-post layout). Used by ThreadTree for the target post.
	prominentTimestamp?: boolean;
}

export function SocialPostCard( {
	post,
	variant = 'default',
	expandedVideo,
	prominentTimestamp,
}: SocialPostCardProps ) {
	const isCompact = variant === 'compact';
	const showProminentTimestamp = ! isCompact && Boolean( prominentTimestamp );

	// Drop nested quotes inside compact (quote-embedded) cards to avoid quote-of-quote chains.
	const isQuoteEmbed = post.embed?.type === 'quote' || post.embed?.type === 'quote_with_media';
	const showEmbed = post.embed && ( ! isCompact || ! isQuoteEmbed );

	const card = (
		<Card className={ clsx( 'social-post-card', `social-post-card--${ variant }` ) }>
			<CardBody>
				<PostCardHeader
					post={ post }
					variant={ variant }
					prominentTimestamp={ showProminentTimestamp }
				/>
				<PostCardBody post={ post } />
				{ showEmbed && post.embed && (
					<PostCardEmbed
						embed={ post.embed }
						parentPostUri={ post.uri }
						expandedVideo={ expandedVideo }
						compact={ isCompact }
					/>
				) }
				{ showProminentTimestamp && <PostCardTimestamp post={ post } /> }
				{ ! isCompact && <PostCardCounts counts={ post.counts } postUri={ post.uri } /> }
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
