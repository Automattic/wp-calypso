import { PostCardEmbedExternal } from './post-card-embed-external';
import { PostCardEmbedImages } from './post-card-embed-images';
import { PostCardEmbedQuote } from './post-card-embed-quote';
import { PostCardEmbedQuoteWithMedia } from './post-card-embed-quote-with-media';
import { PostCardEmbedVideo } from './post-card-embed-video';
import type { AtmosphereEmbed } from '@automattic/api-core';

interface PostCardEmbedProps {
	embed: AtmosphereEmbed;
	parentPostUri: string;
	expandedVideo?: boolean;
	parentUrl?: string;
	// Set when the embed renders inside a compact post card (i.e. a quote
	// envelope). Inner anchors are swapped for inert wrappers so the outer
	// quote-link <a> doesn't end up with nested-anchor markup. The quote /
	// quote_with_media branches are unreachable when compact is true (the
	// SocialPostCard guard filters them out before this dispatcher runs).
	compact?: boolean;
}

export function PostCardEmbed( {
	embed,
	parentPostUri,
	expandedVideo,
	parentUrl,
	compact,
}: PostCardEmbedProps ) {
	switch ( embed.type ) {
		case 'images':
			return <PostCardEmbedImages embed={ embed } compact={ compact } />;
		case 'video':
			return (
				<PostCardEmbedVideo embed={ embed } expanded={ expandedVideo } parentUrl={ parentUrl } />
			);
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
	}
}
