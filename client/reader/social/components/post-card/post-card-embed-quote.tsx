import { useSocialAnalytics } from './analytics-context';
import { PostCardEmbedQuoteTombstone } from './post-card-embed-quote-tombstone';
import { SocialPostCard } from './index';
import type { AtmosphereEmbedQuote } from '@automattic/api-core';

interface PostCardEmbedQuoteProps {
	embed: AtmosphereEmbedQuote;
	parentPostUri: string;
}

export function PostCardEmbedQuote( { embed, parentPostUri }: PostCardEmbedQuoteProps ) {
	const analytics = useSocialAnalytics();
	if ( embed.post.type === 'not_found' || embed.post.type === 'blocked' ) {
		return <PostCardEmbedQuoteTombstone tombstone={ embed.post } />;
	}
	const inner = embed.post;
	const handleClick = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_quote_clicked`, {
			connection_id: analytics.connectionId,
			parent_uri: parentPostUri,
			quoted_uri: inner.uri,
		} );
	};
	return (
		<a
			className="social-post-card-embed-quote-link"
			href={ inner.bluesky_url }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ handleClick }
		>
			<SocialPostCard post={ inner } variant="compact" />
		</a>
	);
}
