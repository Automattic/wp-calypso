import type { CurrencyOverrides } from './types';

export async function fetchCurrencyOverrides( signal?: AbortSignal ): Promise< CurrencyOverrides > {
	const response = await fetch( 'https://public-api.wordpress.com/wpcom/v2/currency-overrides', {
		signal,
	} );

	if ( ! response.ok ) {
		throw new Error(
			`The /wpcom/v2/currency-overrides endpoint returned an error: ${ response.status } ${ response.statusText }`
		);
	}

	return await response.json();
}
