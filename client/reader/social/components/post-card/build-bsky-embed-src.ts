const BSKY_HOSTS = new Set( [ 'bsky.app', 'www.bsky.app' ] );
const EMBED_BASE = 'https://embed.bsky.app/static/embed.html';

export function buildBskyEmbedSrc( blueskyUrl: string ): string | null {
	if ( ! blueskyUrl ) {
		return null;
	}
	let parsed: URL;
	try {
		parsed = new URL( blueskyUrl );
	} catch {
		return null;
	}
	if ( ! BSKY_HOSTS.has( parsed.host ) ) {
		return null;
	}
	return `${ EMBED_BASE }?url=${ encodeURIComponent( blueskyUrl ) }`;
}
