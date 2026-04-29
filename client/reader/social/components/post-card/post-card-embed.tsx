import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, type ReactNode } from 'react';
import { PostCardEmbedAudio } from './post-card-embed-audio';
import { PostCardEmbedExternal } from './post-card-embed-external';
import { PostCardEmbedGifv } from './post-card-embed-gifv';
import { PostCardEmbedImages } from './post-card-embed-images';
import { PostCardEmbedQuote } from './post-card-embed-quote';
import { PostCardEmbedQuoteWithMedia } from './post-card-embed-quote-with-media';
import { PostCardEmbedVideo } from './post-card-embed-video';
import type { SocialEmbed } from '../../types';

interface PostCardEmbedProps {
	embed: SocialEmbed;
	parentPostUri: string;
	expandedVideo?: boolean;
	compact?: boolean;
	// True when the post is flagged sensitive but does NOT carry a
	// whole-post spoiler_text gate. Blurs media until the user clicks
	// "Show". Quote-only embeds aren't blurred — the inner post has its
	// own sensitive flag if applicable.
	sensitive?: boolean;
}

export function PostCardEmbed( {
	embed,
	parentPostUri,
	expandedVideo,
	compact,
	sensitive,
}: PostCardEmbedProps ) {
	const inner = renderEmbed( { embed, parentPostUri, expandedVideo, compact } );
	if ( ! sensitive || isQuoteEmbed( embed ) ) {
		return inner;
	}
	return <SensitiveMediaBlur>{ inner }</SensitiveMediaBlur>;
}

function isQuoteEmbed( embed: SocialEmbed ): boolean {
	return embed.type === 'quote' || embed.type === 'quote_with_media';
}

function renderEmbed( {
	embed,
	parentPostUri,
	expandedVideo,
	compact,
}: {
	embed: SocialEmbed;
	parentPostUri: string;
	expandedVideo?: boolean;
	compact?: boolean;
} ): ReactNode {
	switch ( embed.type ) {
		case 'images':
			return <PostCardEmbedImages embed={ embed } compact={ compact } />;
		case 'video':
			return <PostCardEmbedVideo embed={ embed } expanded={ expandedVideo } />;
		case 'external':
			return (
				<PostCardEmbedExternal
					embed={ embed }
					parentPostUri={ parentPostUri }
					compact={ compact }
				/>
			);
		case 'quote':
			return <PostCardEmbedQuote embed={ embed } parentPostUri={ parentPostUri } />;
		case 'quote_with_media':
			return <PostCardEmbedQuoteWithMedia embed={ embed } parentPostUri={ parentPostUri } />;
		case 'gifv':
			return <PostCardEmbedGifv embed={ embed } />;
		case 'audio':
			return <PostCardEmbedAudio embed={ embed } />;
	}
}

// Mastodon's `sensitive` flag means the media should be blurred until the
// user opts in — separate from `spoiler_text` (which gates the entire post).
function SensitiveMediaBlur( { children }: { children: ReactNode } ) {
	const translate = useTranslate();
	const [ revealed, setRevealed ] = useState( false );

	if ( revealed ) {
		return <>{ children }</>;
	}

	return (
		<div className="social-post-card-embed-sensitive">
			<div className="social-post-card-embed-sensitive__blur">{ children }</div>
			<div className="social-post-card-embed-sensitive__cover">
				<Button
					variant="secondary"
					onClick={ ( e: React.MouseEvent ) => {
						e.preventDefault();
						e.stopPropagation();
						setRevealed( true );
					} }
				>
					{ translate( 'Show sensitive media' ) }
				</Button>
			</div>
		</div>
	);
}
