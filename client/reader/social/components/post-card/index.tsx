import './style.scss';

import { Button, Card, CardBody } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, type ReactNode } from 'react';
import { PostCardBody } from './post-card-body';
import { PostCardCounts } from './post-card-counts';
import { PostCardEmbed } from './post-card-embed';
import { PostCardHeader } from './post-card-header';
import { PostCardLink } from './post-card-link';
import { PostCardTimestamp } from './post-card-timestamp';
import type { SocialContentWarning, SocialPost } from '../../types';

type SocialPostCardVariant = 'default' | 'compact';

interface SocialPostCardProps {
	post: SocialPost;
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

	const cw = post.content_warning;
	// Whole-post CW gate fires when spoiler_text is set. Bare `sensitive`
	// (no spoiler) gates only the media embed (handled inside PostCardEmbed
	// via the `sensitive` prop) so the body still renders.
	const cwGate = cw && cw.spoiler_text ? cw : null;

	const bodyAndEmbed: ReactNode = (
		<>
			<PostCardBody post={ post } />
			{ showEmbed && post.embed && (
				<PostCardEmbed
					embed={ post.embed }
					parentPostUri={ post.uri }
					expandedVideo={ expandedVideo }
					compact={ isCompact }
					// Bare `sensitive` (no whole-post CW) blurs the media.
					sensitive={ ! cwGate && Boolean( cw?.sensitive ) }
				/>
			) }
		</>
	);

	const card = (
		<Card className={ clsx( 'social-post-card', `social-post-card--${ variant }` ) }>
			<CardBody>
				<PostCardHeader
					post={ post }
					variant={ variant }
					prominentTimestamp={ showProminentTimestamp }
				/>
				{ cwGate ? (
					<ContentWarningGate warning={ cwGate }>{ bodyAndEmbed }</ContentWarningGate>
				) : (
					bodyAndEmbed
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

// Gates BOTH the post body (text) and any media embed behind a "Show
// content" button when the post carries a content-warning spoiler.
// Used by the Mastodon spoiler_text path; bare `sensitive` media blurs
// without triggering this gate (handled by PostCardEmbed instead).
function ContentWarningGate( {
	warning,
	children,
}: {
	warning: SocialContentWarning;
	children: ReactNode;
} ) {
	const translate = useTranslate();
	const [ revealed, setRevealed ] = useState( false );

	if ( revealed ) {
		return <>{ children }</>;
	}

	return (
		<div className="social-post-card-content-warning">
			<p className="social-post-card-content-warning__spoiler">{ warning.spoiler_text }</p>
			<Button
				variant="secondary"
				onClick={ ( e: React.MouseEvent ) => {
					// Prevent the card-link overlay from intercepting and navigating away.
					e.preventDefault();
					e.stopPropagation();
					setRevealed( true );
				} }
			>
				{ translate( 'Show content' ) }
			</Button>
		</div>
	);
}
