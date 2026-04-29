import type {
	SocialEmbed,
	SocialEmbedAudio,
	SocialEmbedGifv,
	SocialEmbedImages,
	SocialEmbedVideo,
	SocialPost,
	SocialThreadNode,
	SocialThreadPostNode,
} from '../types';
import type {
	MastodonFeedItem,
	MastodonMediaAttachment,
	MastodonThreadNode,
	MastodonThreadResponse,
	MastodonTimelineAccount,
} from '@automattic/api-core';

export interface MapMastodonOptions {
	/**
	 * Home instance host for the connection (e.g. `mastodon.social`).
	 * Used to (a) build a profile URL when the upstream Account block
	 * doesn't include one, and (b) qualify local-account `acct` values
	 * (which Mastodon emits without an `@instance` suffix) so the
	 * post-card header always shows a webfinger-style handle.
	 */
	instance: string;
}

export function mapMastodonFeedItemToSocialPost(
	item: MastodonFeedItem,
	options: MapMastodonOptions
): SocialPost {
	const post: SocialPost = {
		// `id` is the Mastodon status id (unique per post per instance).
		// `url` is the canonical web URL — two boosts of the same post
		// share a `url`, so it's not safe to use as a React key.
		uri: item.id,
		permalink: item.url,
		text: '',
		html: item.content,
		created_at: item.created_at,
		indexed_at: null,
		lang: item.language ? [ item.language ] : [],
		author: mapAccount( item.account, options.instance ),
		reply_parent: null,
		reply_root: null,
		reason: item.boost
			? {
					type: 'repost',
					by: {
						id: item.boost.by.id,
						handle: qualifyAcct( item.boost.by.acct, options.instance ),
						display_name: item.boost.by.display_name,
					},
			  }
			: null,
		counts: {
			replies: item.counts.replies,
			reposts: item.counts.boosts,
			likes: item.counts.favourites,
			quotes: 0,
		},
		embed: mapMedia( item.media ),
	};
	// Mastodon distinguishes spoiler_text (whole-post CW gate) from
	// sensitive (media blur). Set content_warning when either is present
	// so the post-card can decide independently.
	if ( item.spoiler_text || item.sensitive ) {
		post.content_warning = {
			spoiler_text: item.spoiler_text,
			sensitive: item.sensitive,
		};
	}
	return post;
}

function mapAccount( account: MastodonTimelineAccount, instance: string ): SocialPost[ 'author' ] {
	return {
		id: account.id,
		handle: qualifyAcct( account.acct, instance ),
		display_name: account.display_name,
		avatar: account.avatar,
		profile_url: profileUrl( account.acct, instance ),
	};
}

// Local accounts return `acct: 'alice'`; remote accounts return
// `acct: 'carol@infosec.exchange'`. Always render fully-qualified.
function qualifyAcct( acct: string, instance: string ): string {
	return acct.includes( '@' ) ? acct : `${ acct }@${ instance }`;
}

// Local: `https://<connection-instance>/@<username>`.
// Remote: `https://<remote-instance>/@<username>` — direct, no redirect
// through the connection's home instance.
function profileUrl( acct: string, instance: string ): string {
	const at = acct.indexOf( '@' );
	if ( at === -1 ) {
		return `https://${ instance }/@${ acct }`;
	}
	const username = acct.slice( 0, at );
	const remoteInstance = acct.slice( at + 1 );
	return `https://${ remoteInstance }/@${ username }`;
}

// Mastodon allows mixed-type attachments per status. Pick the dominant
// type via the priority rule (images > video > gifv > audio), grouping
// images so a four-photo status renders as one image grid. Returns null
// when no attachment matches a renderable type.
function mapMedia( media: MastodonMediaAttachment[] ): SocialEmbed | null {
	if ( ! media || media.length === 0 ) {
		return null;
	}

	const images = media.filter( ( m ) => m.type === 'image' );
	if ( images.length > 0 ) {
		const result: SocialEmbedImages = {
			type: 'images',
			images: images.map( ( m ) => ( {
				thumb: m.preview_url ?? m.url,
				fullsize: m.url,
				alt: m.alt,
				aspect_ratio: m.aspect_ratio,
			} ) ),
		};
		return result;
	}

	const video = media.find( ( m ) => m.type === 'video' );
	if ( video ) {
		const result: SocialEmbedVideo = {
			type: 'video',
			playlist: video.url,
			thumbnail: video.preview_url ?? video.url,
			alt: video.alt,
			aspect_ratio: video.aspect_ratio,
		};
		return result;
	}

	const gifv = media.find( ( m ) => m.type === 'gifv' );
	if ( gifv ) {
		const result: SocialEmbedGifv = {
			type: 'gifv',
			src: gifv.url,
			thumbnail: gifv.preview_url ?? gifv.url,
			alt: gifv.alt,
			aspect_ratio: gifv.aspect_ratio,
		};
		return result;
	}

	const audio = media.find( ( m ) => m.type === 'audio' );
	if ( audio ) {
		const result: SocialEmbedAudio = {
			type: 'audio',
			src: audio.url,
			alt: audio.alt,
			duration_seconds: null,
		};
		return result;
	}

	return null;
}

// Convert the backend's recursive Mastodon thread node into the recursive
// SocialThreadNode shape ThreadTree consumes. Backend shape mirrors
// atmosphere's: thread.post is the focal status, thread.parent walks up
// the ancestor chain as a linked list, thread.replies is a recursive
// array. Tombstones (not_found / blocked) pass through as-is.
export function mapMastodonThreadResponseToSocialThreadNode(
	response: MastodonThreadResponse,
	options: MapMastodonOptions
): SocialThreadNode {
	return mapMastodonThreadNode( response.thread, options );
}

function mapMastodonThreadNode(
	node: MastodonThreadNode,
	options: MapMastodonOptions
): SocialThreadNode {
	if ( node.type === 'not_found' || node.type === 'blocked' ) {
		return { type: node.type, uri: node.uri };
	}
	const replies = Array.isArray( node.replies ) ? node.replies.filter( Boolean ) : [];
	const result: SocialThreadPostNode = {
		type: 'post',
		post: mapMastodonFeedItemToSocialPost( node.post, options ),
		parent: node.parent ? mapMastodonThreadNode( node.parent, options ) : null,
		replies: replies.map( ( reply ) => mapMastodonThreadNode( reply, options ) ),
	};
	return result;
}
