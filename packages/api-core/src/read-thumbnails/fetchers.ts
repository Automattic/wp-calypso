import type { ReaderThumbnailEmbed } from './types';

async function fetchJson( url: string ): Promise< unknown > {
	const response = await globalThis.fetch( url );
	if ( ! response.ok ) {
		throw new Error( response.statusText );
	}
	return response.json();
}

interface VideoPressPosterResponse {
	poster?: string;
}

interface VimeoVideoResponse {
	thumbnail_large?: string;
}

interface PocketcastsOembedResponse {
	thumbnail_url?: string;
	thumbnail_width?: number;
	thumbnail_height?: number;
}

export const POCKETCAST_DEFAULT_WIDTH = 220;
export const POCKETCAST_DEFAULT_HEIGHT = 80;

function fetchYoutubeThumbnail( id: string ): string {
	return `https://img.youtube.com/vi/${ encodeURIComponent( id ) }/mqdefault.jpg`;
}

async function fetchVideoPressThumbnail( id: string ): Promise< string | null > {
	try {
		const json = ( await fetchJson(
			`https://public-api.wordpress.com/rest/v1.1/videos/${ encodeURIComponent( id ) }/poster`
		) ) as VideoPressPosterResponse;
		return json?.poster ?? null;
	} catch {
		return null;
	}
}

async function fetchVimeoThumbnail( id: string ): Promise< string | null > {
	try {
		const json = ( await fetchJson(
			`https://vimeo.com/api/v2/video/${ encodeURIComponent( id ) }.json`
		) ) as VimeoVideoResponse[];
		return json?.[ 0 ]?.thumbnail_large ?? null;
	} catch {
		return null;
	}
}

async function fetchPocketcastsThumbnail( id: string ): Promise< string | null > {
	try {
		const pocketcastsUrl = encodeURIComponent( `https://pca.st/${ id }` );
		const json = ( await fetchJson(
			`https://pca.st/oembed.json?url=${ pocketcastsUrl }`
		) ) as PocketcastsOembedResponse;
		const thumbnailUrl = json?.thumbnail_url;
		if ( ! thumbnailUrl ) {
			return null;
		}
		const width = json?.thumbnail_width ?? POCKETCAST_DEFAULT_WIDTH;
		const height = json?.thumbnail_height ?? POCKETCAST_DEFAULT_HEIGHT;
		return `${ thumbnailUrl }?w=${ width }&h=${ height }`;
	} catch {
		return null;
	}
}

export async function fetchReaderThumbnail(
	embed: ReaderThumbnailEmbed
): Promise< string | null > {
	const { service, id } = embed;
	switch ( service ) {
		case 'youtube':
			return fetchYoutubeThumbnail( id );
		case 'videopress':
			return fetchVideoPressThumbnail( id );
		case 'vimeo':
			return fetchVimeoThumbnail( id );
		case 'pocketcasts':
			return fetchPocketcastsThumbnail( id );
	}
	return null;
}
