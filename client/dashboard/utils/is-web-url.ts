import { getProtocol } from '@wordpress/url';

export function isWebUrl( url: string ): boolean {
	const protocol = getProtocol( url );

	return protocol === 'http:' || protocol === 'https:';
}
