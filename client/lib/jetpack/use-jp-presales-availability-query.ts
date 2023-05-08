import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import type { SetStateAction, Dispatch } from 'react';

type PresalesChatResponse = {
	is_available: boolean;
};

//the API is rate limited if we hit the limit we'll back off and retry
async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retries = 3,
	delay = 30000
): Promise< Response > {
	try {
		const response = await fetch( url, options );

		if ( response.status === 429 && retries > 0 ) {
			await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
			return await fetchWithRetry( url, options, retries - 1, delay * 2 );
		}

		return response;
	} catch ( error ) {
		if ( retries > 0 ) {
			await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
			return await fetchWithRetry( url, options, retries - 1, delay * 2 );
		}
		throw error;
	}
}

export function useJpPresalesAvailabilityQuery( setError?: Dispatch< SetStateAction< boolean > > ) {
	//adding a safeguard to ensure if there's an unkown error with the widget it won't crash the whole app
	try {
		return useQuery< boolean, Error >(
			[ 'presales-availability' ],
			async () => {
				const url = 'https://public-api.wordpress.com/wpcom/v2/presales/chat';
				const queryObject = {
					group: 'jp_presales',
				};

				const response = await fetchWithRetry(
					addQueryArgs( url, queryObject as Record< string, string > ),
					{
						credentials: 'same-origin',
						mode: 'cors',
					}
				);

				if ( ! response.ok ) {
					throw new Error( `API request failed with status ${ response.status }` );
				}

				const data: PresalesChatResponse = await response.json();
				return data.is_available;
			},
			{
				meta: { persist: false },
			}
		);
	} catch ( error ) {
		setError && setError( true );
		return { data: false };
	}
}
