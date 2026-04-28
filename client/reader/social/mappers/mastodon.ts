import type { SocialEmbed, SocialPost, SocialQuoteTombstone } from '../types';
import type { MastodonEmbed, MastodonFeedItem, MastodonQuoteTombstone } from '@automattic/api-core';

export function mapMastodonFeedItemToSocialPost( item: MastodonFeedItem ): SocialPost {
	return {
		uri: item.uri,
		permalink: item.uri,
		text: item.text,
		html: item.html,
		created_at: item.created_at,
		indexed_at: item.edited_at,
		lang: item.lang ? [ item.lang ] : [],
		author: {
			id: item.author.id,
			handle: item.author.acct,
			display_name: item.author.display_name,
			avatar: item.author.avatar,
			profile_url: item.author.url,
		},
		reply_parent: item.reply_parent
			? { uri: item.reply_parent.uri, author: { handle: item.reply_parent.author.acct } }
			: null,
		reply_root: item.reply_root
			? { uri: item.reply_root.uri, author: { handle: item.reply_root.author.acct } }
			: null,
		reason: item.reason
			? {
					type: 'repost',
					by: {
						handle: item.reason.by.acct,
						display_name: item.reason.by.display_name,
					},
			  }
			: null,
		counts: {
			replies: item.counts.replies,
			reposts: item.counts.reblogs,
			likes: item.counts.favourites,
			quotes: item.counts.quotes ?? 0,
		},
		embed: item.embed ? mapEmbed( item.embed ) : null,
	};
}

function mapEmbed( embed: MastodonEmbed ): SocialEmbed {
	switch ( embed.type ) {
		case 'images':
		case 'video':
		case 'gifv':
		case 'audio':
		case 'external':
			return embed;
		case 'quote':
			return { type: 'quote', post: mapQuoted( embed.post ) };
		case 'quote_with_media':
			return {
				type: 'quote_with_media',
				post: mapQuoted( embed.post ),
				media: embed.media,
			};
	}
}

function mapQuoted(
	post: MastodonFeedItem | MastodonQuoteTombstone
): SocialPost | SocialQuoteTombstone {
	if ( 'type' in post ) {
		return { type: post.type, uri: post.uri, reason: post.reason };
	}
	return mapMastodonFeedItemToSocialPost( post );
}
