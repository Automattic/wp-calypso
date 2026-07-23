import wpcom from 'calypso/lib/wp';

export const BUILD_WOW_READY_STICKER = 'big_sky_wow_site_ready';

type FetchStickers = ( siteIdentifier: string, signal: AbortSignal ) => Promise< string[] >;

const fetchBlogStickers: FetchStickers = async ( siteIdentifier, signal ) => {
	const response = ( await wpcom.req.get( {
		path: `/sites/${ siteIdentifier }/blog-stickers`,
		apiVersion: '1.1',
		signal,
	} ) ) as unknown;

	return Array.isArray( response ) ? response : [];
};

export function pollForBuildWowReadySticker( {
	siteIdentifier,
	onReady,
	pollIntervalMs = 3000,
	requestTimeoutMs = 15000,
	fetchStickers = fetchBlogStickers,
}: {
	siteIdentifier: string;
	onReady: () => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchStickers?: FetchStickers;
} ): () => void {
	let isActive = true;
	let pollTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestController: AbortController | undefined;

	const poll = async () => {
		requestController = new AbortController();
		requestTimeout = setTimeout( () => requestController?.abort(), requestTimeoutMs );

		try {
			const stickers = await fetchStickers( siteIdentifier, requestController.signal );
			if ( isActive && stickers.includes( BUILD_WOW_READY_STICKER ) ) {
				onReady();
				return;
			}
		} catch {
			// A failed status request does not mean the generation failed.
		} finally {
			if ( requestTimeout !== undefined ) {
				clearTimeout( requestTimeout );
			}
		}

		if ( isActive ) {
			pollTimeout = setTimeout( poll, pollIntervalMs );
		}
	};

	void poll();

	return () => {
		isActive = false;
		if ( pollTimeout !== undefined ) {
			clearTimeout( pollTimeout );
		}
		requestController?.abort();
		if ( requestTimeout !== undefined ) {
			clearTimeout( requestTimeout );
		}
	};
}
