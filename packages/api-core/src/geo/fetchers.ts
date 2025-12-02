import type { GeoLocationData } from './types';

export async function fetchGeo( signal?: AbortSignal ): Promise< GeoLocationData > {
	const version = new Date().getTime();
	const response = await fetch( 'https://public-api.wordpress.com/geo/?v=' + version, { signal } );

	if ( ! response.ok ) {
		throw new Error(
			`The /geo endpoint returned an error: ${ response.status } ${ response.statusText }`
		);
	}

	return await response.json();
}
