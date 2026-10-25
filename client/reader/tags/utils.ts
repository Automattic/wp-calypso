import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { decodeEntities } from '@wordpress/html-entities';
import type { Tag } from './controller';

const safeDecodeURIComponent = ( value: string ): string => {
	try {
		return decodeURIComponent( value );
	} catch {
		return value;
	}
};

// The tags endpoints can return slugs that are already percent-encoded
// (e.g. `b%c3%a4ume`), so decode before encoding to avoid `%25` in links.
export const getTagPath = ( slug: string ): string =>
	addLocaleToPathLocaleInFront( `/tag/${ encodeURIComponent( safeDecodeURIComponent( slug ) ) }` );

// Some titles come back as HTML entities, and some have non-ASCII characters
// replaced with `?` while the slug keeps them intact.
export const getTagTitle = ( { slug, title }: Tag ): string => {
	const decodedTitle = decodeEntities( title ?? '' );
	const decodedSlug = safeDecodeURIComponent( slug ?? '' );
	if ( decodedTitle.includes( '?' ) && /[^\p{ASCII}]/u.test( decodedSlug ) ) {
		return decodedSlug;
	}
	return decodedTitle;
};
