/**
 * Loads the YouTube IFrame Player API on demand and uses it to verify that a
 * given video can actually play in an embedded player on this origin.
 *
 * The oEmbed endpoint catches deleted/private videos but does not catch
 * uploads where the owner has disabled embedding (player error 101/150) or
 * region-blocked content. Instantiating a hidden player and listening for
 * `onError` covers those cases.
 */

interface YTPlayerEvent {
	data: number;
}

interface YTVideoData {
	video_id?: string;
	title?: string;
	author?: string;
}

interface YTPlayer {
	destroy: () => void;
	getVideoData?: () => YTVideoData | undefined;
}

interface YTNamespace {
	Player: new (
		element: HTMLElement | string,
		options: {
			videoId: string;
			host?: string;
			width?: number | string;
			height?: number | string;
			playerVars?: Record< string, unknown >;
			events?: {
				onReady?: ( e: { target: YTPlayer } ) => void;
				onError?: ( e: YTPlayerEvent ) => void;
			};
		}
	) => YTPlayer;
}

declare global {
	interface Window {
		YT?: YTNamespace;
		onYouTubeIframeAPIReady?: () => void;
	}
}

const YT_API_SRC = 'https://www.youtube.com/iframe_api';
const API_LOAD_TIMEOUT_MS = 8_000;
const PLAYER_CHECK_TIMEOUT_MS = 5_000;

let ytApiPromise: Promise< YTNamespace > | null = null;

function loadYouTubeApi(): Promise< YTNamespace > {
	if ( typeof window === 'undefined' || typeof document === 'undefined' ) {
		return Promise.reject( new Error( 'No DOM available' ) );
	}
	if ( window.YT?.Player ) {
		return Promise.resolve( window.YT );
	}
	if ( ytApiPromise ) {
		return ytApiPromise;
	}

	ytApiPromise = new Promise< YTNamespace >( ( resolve, reject ) => {
		const previousCallback = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previousCallback?.();
			if ( window.YT?.Player ) {
				resolve( window.YT );
			} else {
				reject( new Error( 'YT API failed to initialize' ) );
			}
		};

		if ( ! document.querySelector( `script[src="${ YT_API_SRC }"]` ) ) {
			const script = document.createElement( 'script' );
			script.src = YT_API_SRC;
			script.async = true;
			script.onerror = () => reject( new Error( 'Failed to load YT API script' ) );
			document.head.appendChild( script );
		}

		setTimeout( () => reject( new Error( 'YT API load timed out' ) ), API_LOAD_TIMEOUT_MS );
	} );

	ytApiPromise.catch( () => {
		ytApiPromise = null;
	} );

	return ytApiPromise;
}

const ERROR_REASONS: Record< number, string > = {
	2: 'invalid video id',
	5: 'HTML5 player error',
	100: 'video not found or private',
	101: 'embedding disabled by uploader',
	150: 'embedding disabled by uploader',
};

export interface IframeCheckResult {
	ok: boolean;
	errorCode?: number;
	errorReason?: string;
	skipped?: boolean;
	title?: string | null;
	author?: string | null;
}

export async function checkVideoEmbeddable(
	videoId: string,
	timeoutMs = PLAYER_CHECK_TIMEOUT_MS
): Promise< IframeCheckResult > {
	let YT: YTNamespace;
	try {
		YT = await loadYouTubeApi();
	} catch {
		return { ok: true, skipped: true, errorReason: 'YT API unavailable' };
	}

	return new Promise< IframeCheckResult >( ( resolve ) => {
		const container = document.createElement( 'div' );
		container.style.cssText =
			'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;visibility:hidden;pointer-events:none;';
		document.body.appendChild( container );

		let player: YTPlayer | null = null;
		let resolved = false;

		const cleanup = () => {
			if ( player ) {
				try {
					player.destroy();
				} catch {
					// ignore
				}
			}
			container.remove();
		};

		const finish = ( result: IframeCheckResult ) => {
			if ( resolved ) {
				return;
			}
			resolved = true;
			cleanup();
			resolve( result );
		};

		const timer = setTimeout(
			() => finish( { ok: false, errorReason: 'player did not load in time' } ),
			timeoutMs
		);

		const readVideoData = ( target: YTPlayer ): { title: string | null; author: string | null } => {
			try {
				const data = target.getVideoData?.();
				return {
					title: typeof data?.title === 'string' && data.title ? data.title : null,
					author: typeof data?.author === 'string' && data.author ? data.author : null,
				};
			} catch {
				return { title: null, author: null };
			}
		};

		try {
			player = new YT.Player( container, {
				videoId,
				host: 'https://www.youtube-nocookie.com',
				width: 1,
				height: 1,
				playerVars: {
					autoplay: 0,
					controls: 0,
					mute: 1,
					fs: 0,
					modestbranding: 1,
					rel: 0,
				},
				events: {
					onReady: ( e ) => {
						clearTimeout( timer );
						const { title, author } = readVideoData( e.target );
						if ( ! title ) {
							finish( {
								ok: false,
								errorReason: 'player loaded but returned no video metadata',
							} );
							return;
						}
						finish( { ok: true, title, author } );
					},
					onError: ( e ) => {
						clearTimeout( timer );
						finish( {
							ok: false,
							errorCode: e.data,
							errorReason: ERROR_REASONS[ e.data ] ?? `error code ${ e.data }`,
						} );
					},
				},
			} );
		} catch {
			clearTimeout( timer );
			finish( { ok: false, errorReason: 'iframe instantiation failed' } );
		}
	} );
}

export function extractVideoId( url: string ): string | null {
	let parsed: URL;
	try {
		parsed = new URL( url );
	} catch {
		return null;
	}
	const host = parsed.hostname.toLowerCase().replace( /^www\./, '' );
	if ( host === 'youtu.be' ) {
		return parsed.pathname.slice( 1 ).split( '/' )[ 0 ] || null;
	}
	if ( host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com' ) {
		const v = parsed.searchParams.get( 'v' );
		if ( v ) {
			return v;
		}
		const segs = parsed.pathname.split( '/' ).filter( Boolean );
		if ( ( segs[ 0 ] === 'embed' || segs[ 0 ] === 'shorts' ) && segs[ 1 ] ) {
			return segs[ 1 ];
		}
	}
	return null;
}
