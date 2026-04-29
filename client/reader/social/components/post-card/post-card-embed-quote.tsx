import { useSocialAnalytics } from './analytics-context';
import { PostCardEmbedQuoteTombstone } from './post-card-embed-quote-tombstone';
import { SocialPostCard } from './index';
import type { SocialEmbedQuote } from '../../types';

interface PostCardEmbedQuoteProps {
	embed: SocialEmbedQuote;
	parentPostUri: string;
}

export function PostCardEmbedQuote( { embed, parentPostUri }: PostCardEmbedQuoteProps ) {
	const analytics = useSocialAnalytics();
	// SocialPost has no `type` field; the discriminator only exists on
	// the tombstone shape, so narrow via `in` rather than property access.
	if ( 'type' in embed.post ) {
		return <PostCardEmbedQuoteTombstone tombstone={ embed.post } />;
	}
	const inner = embed.post;
	const inAppUrl = analytics?.getThreadUrl?.( inner.uri ) ?? null;
	const href = inAppUrl ?? inner.permalink;
	const handleClick = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_quote_clicked`, {
			connection_id: analytics.connectionId,
			parent_uri: parentPostUri,
			quoted_uri: inner.uri,
			destination: inAppUrl ? 'in_app_thread' : 'bsky_app',
		} );
	};
	const externalAttrs = inAppUrl ? {} : { target: '_blank', rel: 'noopener noreferrer' };
	return (
		<a
			className="social-post-card-embed-quote-link"
			href={ href }
			{ ...externalAttrs }
			onClick={ handleClick }
		>
			<SocialPostCard post={ inner } variant="compact" />
		</a>
	);
}
