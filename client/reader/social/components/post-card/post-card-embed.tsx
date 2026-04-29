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
}

export function PostCardEmbed( {
	embed,
	parentPostUri,
	expandedVideo,
	compact,
}: PostCardEmbedProps ) {
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
