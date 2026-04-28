import { PostCardEmbedExternal } from './post-card-embed-external';
import { PostCardEmbedImages } from './post-card-embed-images';
import { PostCardEmbedQuote } from './post-card-embed-quote';
import { PostCardEmbedQuoteWithMedia } from './post-card-embed-quote-with-media';
import { PostCardEmbedVideo } from './post-card-embed-video';
import type { AtmosphereEmbed } from '@automattic/api-core';

interface PostCardEmbedProps {
	embed: AtmosphereEmbed;
	parentPostUri: string;
}

export function PostCardEmbed( { embed, parentPostUri }: PostCardEmbedProps ) {
	switch ( embed.type ) {
		case 'images':
			return <PostCardEmbedImages embed={ embed } />;
		case 'video':
			return <PostCardEmbedVideo embed={ embed } />;
		case 'external':
			return <PostCardEmbedExternal embed={ embed } parentPostUri={ parentPostUri } />;
		case 'quote':
			return <PostCardEmbedQuote embed={ embed } parentPostUri={ parentPostUri } />;
		case 'quote_with_media':
			return <PostCardEmbedQuoteWithMedia embed={ embed } parentPostUri={ parentPostUri } />;
	}
}
