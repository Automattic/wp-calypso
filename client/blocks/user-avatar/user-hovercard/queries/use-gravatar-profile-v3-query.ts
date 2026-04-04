import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { UserHovercardResponse } from './use-user-hovercard-query';

interface GravatarProfileV3ApiResponse {
	display_name: string;
	profile_url: string;
	avatar_url: string;
	description: string;
}

export function useGravatarProfileV3Query(
	urls: Array< string | undefined >,
	enabled = true
): UseQueryResult< UserHovercardResponse[ 'user' ], Error > {
	const allHashes = urls.map( extractHashFromUrl ).filter( Boolean ) as string[];
	const hash = allHashes.find( ( h ) => h.length === 64 ) ?? allHashes[ 0 ] ?? null; // Prefer SHA256 hash if available.

	return useQuery( {
		queryKey: [ 'gravatar-profile-v3', hash ],
		queryFn: async () => {
			const response = await fetch(
				`https://api.gravatar.com/v3/profiles/${ hash }?source=hovercard`
			);
			if ( ! response.ok ) {
				throw new Error( `Gravatar API error: ${ response.status }` );
			}
			return response.json() as Promise< GravatarProfileV3ApiResponse >;
		},
		select: mapToHovercardUser,
		enabled: enabled && !! hash,
		staleTime: 30 * 60000, // 30 minutes
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	} );
}

function extractHashFromUrl( url?: string ): string | null {
	if ( ! url ) {
		return null;
	}

	try {
		const lastSegment = new URL( url ).pathname.split( '/' ).filter( Boolean ).pop();

		if ( lastSegment && /^[0-9a-f]{32,64}$/i.test( lastSegment ) ) {
			return lastSegment.toLowerCase();
		}
	} catch {}

	return null;
}

function mapToHovercardUser( raw: GravatarProfileV3ApiResponse ): UserHovercardResponse[ 'user' ] {
	const lastSegment = ( () => {
		try {
			return new URL( raw.profile_url ).pathname.split( '/' ).filter( Boolean ).pop();
		} catch {
			return null;
		}
	} )();

	const wpcomUsername =
		lastSegment && ! /^[0-9a-f]{32,64}$/i.test( lastSegment ) ? lastSegment : '';

	return {
		ID: 0,
		login: wpcomUsername,
		nice_name: wpcomUsername,
		display_name: raw.display_name,
		description: raw.description,
		avatar_URL: raw.avatar_url,
		profile_URL: raw.profile_url,
		first_name: '',
		last_name: '',
	};
}
