import type { SocialProfileCardProps } from '../profile-card';
import type {
	SocialEmbed,
	SocialEmbedAudio,
	SocialEmbedGifv,
	SocialEmbedImages,
	SocialEmbedVideo,
	SocialPost,
} from '../types';
import type {
	FediverseAuthorProfile,
	FediverseConnection,
	FediverseFeedItem,
	FediverseMediaAttachment,
	FediverseTimelineAccount,
} from '@automattic/api-core';

export interface MapFediverseOptions {
	/**
	 * Home host for the connection (e.g. `myblog.wordpress.com`). Used
	 * to (a) build a profile URL when the upstream Account block
	 * doesn't include one and (b) qualify local-account `acct` values
	 * (which the backend may emit without an `@host` suffix) so the
	 * post-card header always shows a webfinger-style handle.
	 */
	host: string;
}

export function mapFediverseFeedItemToSocialPost(
	item: FediverseFeedItem,
	options: MapFediverseOptions
): SocialPost {
	const post: SocialPost = {
		// `id` is the keyring-scoped identifier the rest of the protocol
		// surface routes through (replies, favourites, etc.); `url` is
		// the canonical permalink, not safe as a React key because two
		// boosts of the same post share it.
		uri: item.id,
		permalink: item.url,
		text: '',
		html: item.content,
		created_at: item.created_at,
		indexed_at: null,
		lang: item.language ? [ item.language ] : [],
		author: mapAccount( item.account, options.host ),
		reply_parent: null,
		reply_root: null,
		reason: item.boost
			? {
					type: 'repost',
					by: {
						id: item.boost.by.id,
						handle: qualifyAcct( item.boost.by.acct, options.host ),
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

	// Project boolean viewer flags into the SocialPost viewer shape.
	// `viewer.like` carries a sentinel string when liked (mirrors the
	// atmosphere shape); `viewer.repost` carries 'reblogged' when the
	// viewer has boosted the post. Both default to null when the
	// upstream boolean is false or viewer is absent.
	if ( item.viewer ) {
		post.viewer = {
			like: item.viewer.favourited ? 'favorited' : null,
			repost: item.viewer.reblogged ? 'reblogged' : null,
		};
	}

	// Distinguish spoiler_text (whole-post CW gate) from sensitive
	// (media blur). Set content_warning when either is present so the
	// post-card can decide independently.
	if ( item.spoiler_text || item.sensitive ) {
		post.content_warning = {
			spoiler_text: item.spoiler_text,
			sensitive: item.sensitive,
		};
	}
	return post;
}

function mapAccount( account: FediverseTimelineAccount, host: string ): SocialPost[ 'author' ] {
	return {
		id: account.id,
		handle: qualifyAcct( account.acct, host ),
		display_name: account.display_name,
		avatar: account.avatar,
		profile_url: profileUrl( account.acct, host ),
	};
}

/**
 * Strip a leading `@` from a wire `acct` / `webfinger` / `handle` value.
 * Wire values are emitted with a leading `@` (e.g. `@alice@example.com`);
 * surfaces that prefix their own `@` — the post-card header, the
 * empty-title format string, Tracks event props that match the bare
 * `user@host` shape — need it stripped first.
 */
export function stripLeadingAt( handle: string ): string {
	return handle.startsWith( '@' ) ? handle.slice( 1 ) : handle;
}

// Normalise the wire `acct` / `handle` to a bare `user@host` shape:
//   - feed-item accounts may emit `acct: 'alice'` (local) or
//     `acct: 'carol@example.com'` (remote)
//   - the profile endpoint emits `acct` / `handle` with a leading `@`
//     (`'@alice@example.com'`) — `<SocialPostCard>` adds its own `@`
//     at render time, so we must strip it here to avoid `@@user@host`
// Always return webfinger-style without the leading `@`.
function qualifyAcct( acct: string, host: string ): string {
	const stripped = stripLeadingAt( acct );
	return stripped.includes( '@' ) ? stripped : `${ stripped }@${ host }`;
}

// Project a Fediverse author-profile onto the SocialProfileCard prop
// subset (avatar / banner / displayName / handle / bioHtml). Stats and
// statsLabel come from the panel since they're translation-bound.
// Mirrors `mapMastodonAccountToSocialProfileCardProps`.
//
// `host` falls back to `profile.instance` (always present on the wire)
// when the caller doesn't supply one — keeps the call site simple for
// the connected-user `/profile` route, which doesn't have a separate
// "home host" to qualify against.
export function mapFediverseAuthorProfileToSocialProfileCardProps(
	profile: FediverseAuthorProfile,
	options?: Partial< MapFediverseOptions >
): Pick< SocialProfileCardProps, 'avatar' | 'banner' | 'displayName' | 'handle' | 'bioHtml' > {
	const host = options?.host ?? profile.instance;
	return {
		avatar: profile.avatar,
		banner: profile.header,
		// Empty display_name → SocialProfileCard falls back to handle.
		displayName: profile.display_name ? profile.display_name : undefined,
		handle: qualifyAcct( profile.handle, host ),
		bioHtml: profile.note,
	};
}

/**
 * Slim variant used by the connection-level chooser: project a
 * `FediverseConnection` (no AP profile fetch) onto the SocialProfileCard
 * props. Used by the per-connection profile card; the rich author-feed
 * surface uses `mapFediverseAuthorProfileToSocialProfileCardProps`
 * once the profile query resolves.
 */
export function mapFediverseConnectionToSocialProfileCardProps(
	connection: FediverseConnection
): Pick< SocialProfileCardProps, 'avatar' | 'displayName' | 'handle' > {
	return {
		avatar: connection.icon || null,
		displayName: connection.name?.trim() ? connection.name : undefined,
		// `webfinger` is emitted with a leading `@`; `SocialProfileCard`
		// renders the `@` prefix at render time so feed-through would
		// produce `@@user@host`. Strip first.
		handle: stripLeadingAt( connection.webfinger ),
	};
}

// Local: `https://<host>/@<username>`. Remote: `https://<remote-host>/@<username>`
// — direct, no redirect through the connection's home host.
function profileUrl( acct: string, host: string ): string {
	const at = acct.indexOf( '@' );
	if ( at === -1 ) {
		return `https://${ host }/@${ acct }`;
	}
	const username = acct.slice( 0, at );
	const remoteHost = acct.slice( at + 1 );
	return `https://${ remoteHost }/@${ username }`;
}

// Mixed-type media: pick the dominant type (images > video > gifv >
// audio), grouping images so a multi-photo status renders as one
// image grid. Returns null when no attachment matches a renderable type.
function mapMedia( media: FediverseMediaAttachment[] ): SocialEmbed | null {
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
