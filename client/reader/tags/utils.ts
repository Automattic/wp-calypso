import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { decodeEntities } from '@wordpress/html-entities';
import type { Tag } from './controller';

// The tags endpoints can return slugs with non-ASCII characters already
// percent-encoded (e.g. `b%c3%a4ume`). Only those escapes are decoded, since
// the tag route decodes its param twice and needs `%25` and `%2F` kept as is.
const decodeNonAsciiEscapes = ( value: string ): string =>
	value.replace( /(?:%[89a-f][0-9a-f])+/gi, ( escapes ) => {
		try {
			return decodeURIComponent( escapes );
		} catch {
			return escapes;
		}
	} );

const hasNonAscii = ( value: string ): boolean => /[^\p{ASCII}]/u.test( value );

export const getTagPath = ( slug: string ): string =>
	addLocaleToPathLocaleInFront( `/tag/${ encodeURIComponent( decodeNonAsciiEscapes( slug ) ) }` );

// Some titles come back with their non-ASCII characters dropped or replaced
// with `?`, or cut off mid-entity, while the slug keeps the characters intact.
export const recoverTagTitle = ( slug: string, title: string ): string => {
	const decodedSlug = decodeNonAsciiEscapes( slug ?? '' );
	if ( ! hasNonAscii( decodedSlug ) ) {
		return title;
	}
	if ( ! hasNonAscii( title ?? '' ) || /&(?:#\d*)?$/.test( title ?? '' ) ) {
		return decodedSlug.replace( /-/g, ' ' );
	}
	return title;
};

export const getTagTitle = ( { slug, title }: Tag ): string =>
	recoverTagTitle( slug, decodeEntities( title ?? '' ) );
