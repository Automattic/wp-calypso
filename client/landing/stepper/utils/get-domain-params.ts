import { getQuery } from './get-query';

/**
 * Parses and returns the domain query parameters from the URL
 * @returns An object with the query parameters
 */
export const getDomainParams = () => {
	const query = getQuery();
	return {
		domain: query[ 'domain' ] as string | null,
		provider: query[ 'provider' ] as string | null,
	};
};
