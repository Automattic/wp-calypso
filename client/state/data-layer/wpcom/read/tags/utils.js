/**
 * External dependencies
 */
import { map, compact, concat } from 'lodash';
import { decodeEntities } from 'calypso/lib/formatting';

/**
 * Normalize response from the api so whether we get back a single tag or a list of tags
 * we always pass forward a list
 * Also transform the api response to be something more calypso-friendly
 *
 * @param  {Object} apiResponse api response from the tags endpoint
 * @returns {Array} An array containing all of the normalized tags in the format:
 *  [
 *    { id, displayName, url, title, slug },
 *    ...
 *  ]
 */
export function fromApi( apiResponse ) {
	if ( ! apiResponse || ( ! apiResponse.tag && ! apiResponse.tags ) ) {
		throw new Error( `invalid tags response: ${ JSON.stringify( apiResponse ) }` );
	}

	const tags = compact(
		concat(
			[],
			typeof apiResponse.tag === 'object' && apiResponse.tag,
			Array.isArray( apiResponse.tags ) && apiResponse.tags
		)
	);

	return map( tags, ( tag ) => ( {
		id: tag.ID,
		displayName: decodeEntities( tag.display_name ),
		url: `/tag/${ tag.slug }`,
		title: decodeEntities( tag.title ),
		slug: tag.slug.toLowerCase(),
	} ) );
}
