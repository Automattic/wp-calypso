import { convertPlatformName } from 'calypso/blocks/import/util';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

/** The API only accepts public HTTPS URLs, and users mostly type a bare domain. */
export const toSourceUrl = ( from?: string | null ): string => {
	const value = ( from ?? '' ).trim();
	if ( ! value ) {
		return '';
	}
	return /^https?:\/\//i.test( value )
		? value.replace( /^http:\/\//i, 'https://' )
		: `https://${ value }`;
};

export const getSourceHost = ( from?: string | null ): string => {
	const url = toSourceUrl( from );
	if ( ! url ) {
		return '';
	}
	try {
		return new URL( url ).hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
};

/** Display name for a detected platform, or undefined when it is not known. */
export const getPlatformName = ( platform?: string | null ): string | undefined => {
	if ( ! platform || platform === 'unknown' ) {
		return undefined;
	}
	const name = convertPlatformName( platform as ImporterPlatform );
	return name === 'Unknown' ? undefined : name;
};

export const getFreeSubdomain = ( host: string ): string =>
	`${ host.split( '.' )[ 0 ] || 'yoursite' }.wordpress.com`;
