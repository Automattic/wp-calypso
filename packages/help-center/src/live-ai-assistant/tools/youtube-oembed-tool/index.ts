import { checkVideoEmbeddable, extractVideoId } from './iframe-check';

export const VERIFY_YOUTUBE_URL_TOOL_NAME = 'verify_youtube_url_tool';

const MAX_CANDIDATES = 5;

export const verifyYoutubeUrlToolDefinition = {
	type: 'function',
	name: VERIFY_YOUTUBE_URL_TOOL_NAME,
	description:
		"Verify that a YouTube URL is actually embeddable by loading it in a hidden YouTube iframe player on this page. Use this BEFORE inserting a YouTube embed (core/embed with a youtube.com / youtu.be URL) when you have recalled the video ID from your own knowledge — the player tells us whether the video plays AND returns the real title and uploader so you can confirm it matches what the user asked for. Pass `urls` as an array of 1–5 candidate URLs ordered by your confidence; the tool tries them in order and returns the FIRST one that loads in the player. Videos that are deleted, private, age-restricted, embedding-disabled, or region-blocked are rejected. If none load, the response includes per-URL errors so you can revise. If the returned title/author do not match the user's request, recall a fresh batch of candidate URLs and call again. Never embed a URL you have not verified here.",
	parameters: {
		type: 'object',
		properties: {
			urls: {
				type: 'array',
				minItems: 1,
				maxItems: MAX_CANDIDATES,
				items: {
					type: 'string',
					description:
						'A full YouTube URL such as "https://www.youtube.com/watch?v=XXXXXXXXXXX" or "https://youtu.be/XXXXXXXXXXX".',
				},
				description:
					'Candidate YouTube URLs to verify, ordered by your confidence. The tool returns the first one that loads.',
			},
		},
		required: [ 'urls' ],
		additionalProperties: false,
	},
} as const;

interface ParsedArgs {
	urls: string[];
}

function parseArgs( rawArgs: unknown ): ParsedArgs {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { urls: [] };
		}
		const raw = args.urls;
		const list: string[] = [];
		if ( Array.isArray( raw ) ) {
			for ( const item of raw ) {
				if ( typeof item === 'string' ) {
					const trimmed = item.trim();
					if ( trimmed ) {
						list.push( trimmed );
					}
				}
				if ( list.length >= MAX_CANDIDATES ) {
					break;
				}
			}
		} else if ( typeof args.url === 'string' && args.url.trim() ) {
			list.push( args.url.trim() );
		}
		return { urls: list };
	} catch {
		return { urls: [] };
	}
}

function isYoutubeUrl( raw: string ): boolean {
	let parsed: URL;
	try {
		parsed = new URL( raw );
	} catch {
		return false;
	}
	if ( parsed.protocol !== 'http:' && parsed.protocol !== 'https:' ) {
		return false;
	}
	const host = parsed.hostname.toLowerCase().replace( /^www\./, '' );
	return (
		host === 'youtube.com' ||
		host === 'm.youtube.com' ||
		host === 'youtu.be' ||
		host === 'youtube-nocookie.com'
	);
}

interface AttemptFailure {
	url: string;
	error: string;
}

interface AttemptSuccess {
	ok: true;
	url: string;
	title: string | null;
	author_name: string | null;
}

async function verifySingleUrl( url: string ): Promise< AttemptSuccess | AttemptFailure > {
	if ( ! isYoutubeUrl( url ) ) {
		return { url, error: 'URL is not a YouTube URL.' };
	}

	const videoId = extractVideoId( url );
	if ( ! videoId ) {
		return { url, error: 'Could not extract a video id from the URL.' };
	}

	const playback = await checkVideoEmbeddable( videoId );
	if ( ! playback.ok ) {
		return {
			url,
			error: `Player rejected the video: ${ playback.errorReason ?? 'unknown reason' }.`,
		};
	}

	return {
		ok: true,
		url,
		title: playback.title ?? null,
		author_name: playback.author ?? null,
	};
}

export async function executeVerifyYoutubeUrlTool( rawArgs: unknown ) {
	const { urls } = parseArgs( rawArgs );
	if ( ! urls.length ) {
		return { ok: false, error: 'A "urls" array with at least one candidate is required.' };
	}

	const failures: AttemptFailure[] = [];
	for ( const url of urls ) {
		const outcome = await verifySingleUrl( url );
		if ( 'ok' in outcome && outcome.ok ) {
			return {
				ok: true,
				url: outcome.url,
				title: outcome.title,
				author_name: outcome.author_name,
				attempts: failures,
			};
		}
		failures.push( outcome as AttemptFailure );
	}

	return {
		ok: false,
		error: 'None of the candidate URLs loaded in the player.',
		attempts: failures,
	};
}
