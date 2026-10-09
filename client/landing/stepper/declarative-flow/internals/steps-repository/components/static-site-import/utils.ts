import { convertPlatformName } from 'calypso/blocks/import/util';
import { addSchemeIfMissing } from 'calypso/lib/url';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

/** The API only accepts HTTPS URLs, and users mostly type a bare domain. */
export const toSourceUrl = ( from?: string | null ): string =>
	from?.trim() ? addSchemeIfMissing( from.trim(), 'https' ).replace( /^http:/i, 'https:' ) : '';

export const getSourceHost = ( from?: string | null ): string => {
	try {
		return new URL( toSourceUrl( from ) ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
};

export const getPlatformName = ( platform?: string | null ): string | undefined => {
	const name = platform ? convertPlatformName( platform as ImporterPlatform ) : 'Unknown';
	return name === 'Unknown' ? undefined : name;
};
