import type { WpOrgCoreVersionCheck } from './types';

export async function fetchWpOrgCoreVersion(
	channel: string = 'latest'
): Promise< string | undefined > {
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

	const data: WpOrgCoreVersionCheck = await response.json();
	return data.offers?.[ 0 ]?.version;
}
