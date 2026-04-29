import { __experimentalVStack as VStack } from '@wordpress/components';
import { PostCardEmbedImages } from './post-card-embed-images';
import { PostCardEmbedQuote } from './post-card-embed-quote';
import { PostCardEmbedVideo } from './post-card-embed-video';
import type { AtmosphereEmbedQuoteWithMedia } from '@automattic/api-core';

interface PostCardEmbedQuoteWithMediaProps {
	embed: AtmosphereEmbedQuoteWithMedia;
	parentPostUri: string;
}

export function PostCardEmbedQuoteWithMedia( {
	embed,
	parentPostUri,
}: PostCardEmbedQuoteWithMediaProps ) {
	return (
		<VStack spacing={ 2 } className="social-post-card-embed-quote-with-media">
			<PostCardEmbedQuote
				embed={ { type: 'quote', post: embed.post } }
				parentPostUri={ parentPostUri }
			/>
			{ embed.media?.type === 'images' && <PostCardEmbedImages embed={ embed.media } /> }
			{ embed.media?.type === 'video' && <PostCardEmbedVideo embed={ embed.media } /> }
		</VStack>
	);
}
