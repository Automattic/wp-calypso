import type { WpOrgCoreVersionCheck } from './types';

export async function fetchWpOrgCoreVersionCheck(
	channel: string = 'latest'
): Promise< WpOrgCoreVersionCheck > {
	const response = await fetch(
		`https://api.wordpress.org/core/version-check/1.7/?channel=${ channel }`,
		{
			method: 'GET',
			headers: { Accept: 'application/json' },
		}
	);

	if ( ! response.ok ) {
		throw new Error( `Failed to fetch WordPress core version check: ${ response.status }` );
	}

	return response.json();
}
