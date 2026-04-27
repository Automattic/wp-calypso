import { PostCardEmbedQuoteTombstone } from './post-card-embed-quote-tombstone';
import { SocialPostCard } from './index';
import type { AtmosphereEmbedQuote } from '@automattic/api-core';

interface PostCardEmbedQuoteProps {
	embed: AtmosphereEmbedQuote;
	parentPostUri: string;
}

export function PostCardEmbedQuote( { embed }: PostCardEmbedQuoteProps ) {
	if ( embed.post.type === 'not_found' || embed.post.type === 'blocked' ) {
		return <PostCardEmbedQuoteTombstone tombstone={ embed.post } />;
	}
	return <SocialPostCard post={ embed.post } variant="compact" />;
}
