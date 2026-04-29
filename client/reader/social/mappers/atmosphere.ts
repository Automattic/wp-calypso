import type { SocialEmbed, SocialPost, SocialQuoteTombstone } from '../types';
import type {
	AtmosphereEmbed,
	AtmosphereFeedItem,
	AtmosphereQuoteTombstone,
} from '@automattic/api-core';

const BSKY_PROFILE_BASE = 'https://bsky.app/profile/';

export function mapAtmosphereFeedItemToSocialPost( item: AtmosphereFeedItem ): SocialPost {
	return {
		uri: item.uri,
		permalink: item.bluesky_url,
		text: item.text,
		html: item.html,
		created_at: item.created_at,
		indexed_at: item.indexed_at,
		lang: item.lang,
		author: {
			id: item.author.did,
			handle: item.author.handle,
			display_name: item.author.display_name,
			avatar: item.author.avatar,
			profile_url: BSKY_PROFILE_BASE + item.author.handle,
		},
		reply_parent: item.reply_parent
			? { uri: item.reply_parent.uri, author: { handle: item.reply_parent.author.handle } }
			: null,
		reply_root: item.reply_root
			? { uri: item.reply_root.uri, author: { handle: item.reply_root.author.handle } }
			: null,
		reason: item.reason
			? {
					type: 'repost',
					by: {
						id: item.reason.by.did,
						handle: item.reason.by.handle,
						display_name: item.reason.by.display_name,
					},
			  }
			: null,
		counts: item.counts,
		embed: item.embed ? mapEmbed( item.embed ) : null,
	};
}

function mapEmbed( embed: AtmosphereEmbed ): SocialEmbed {
	switch ( embed.type ) {
		case 'images':
		case 'video':
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
	post: AtmosphereFeedItem | AtmosphereQuoteTombstone
): SocialPost | SocialQuoteTombstone {
	if ( 'type' in post ) {
		// AtmosphereQuoteBlockedTombstone carries an `author: ActorRef`;
		// AtmosphereQuoteNotFoundTombstone does not. Neither carries a
		// `reason` field on trunk's atmosphere shape, so synthesize the
		// lower-case mirror from `type` for legacy social consumers.
		const tombstone: SocialQuoteTombstone = {
			type: post.type,
			uri: post.uri,
			reason: post.type === 'not_found' ? 'notfound' : 'blocked',
		};
		if ( post.type === 'blocked' ) {
			tombstone.author = { did: post.author.did };
		}
		return tombstone;
	}
	return mapAtmosphereFeedItemToSocialPost( post );
}
