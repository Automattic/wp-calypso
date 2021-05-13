/**
 * External Dependencies
 */
import { escapeRegExp } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	getSiteName,
	getSiteUrl,
	getSiteDescription,
	getSiteAuthorName,
} from 'calypso/reader/get-helpers';

type Follow = Record< string, unknown >;

export function filterFollowsByQuery(
	query: undefined | string,
	follows: Array< Follow >
): Array< Follow > {
	if ( ! query ) {
		return follows;
	}

	const phraseRe = new RegExp( escapeRegExp( query ), 'i' );

	return follows.filter( ( follow ) => {
		const feed = follow.feed;
		const site = follow.site;
		const siteName = getSiteName( { feed, site } );
		const siteUrl = getSiteUrl( { feed, site } );
		const siteDescription = getSiteDescription( { feed, site } );
		const siteAuthor = getSiteAuthorName( site );

		return (
			// NOTE: String pieces are separated by non-breaking space.
			// eslint-disable-next-line no-irregular-whitespace
			`${ follow.URL } ${ siteName } ${ siteUrl } ${ siteDescription } ${ siteAuthor }`.search(
				phraseRe
			) !== -1
		);
	} );
}
