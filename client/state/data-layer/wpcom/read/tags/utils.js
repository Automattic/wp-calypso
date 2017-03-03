/**
 * External dependencies
 */
import { map, compact, concat } from 'lodash';
import { decodeEntities } from 'lib/formatting';

/**
 * Normalize response from the api so whether we get back a single tag or a list of tags
 * we always pass forward a list
 * Also transform the api response to be something more calypso-friendly
 *
 * @param  {Tag|Tags} apiResponse api response from the tags endpoint
 * @return {Tags} An object containing all of the normalized tags in the format:
 * {
 *   [ tag.id ]: tag,
 *   ...
 * }
 */
export function fromApi( apiResponse ) {
	if ( ! apiResponse.tag && ! apiResponse.tags ) {
		if ( process.env.NODE_ENV === 'development' ) {
			throw new Error( 'bad api response for /read/tags' );
		}
		return [];
	}

	const tags = compact( concat( [], apiResponse.tag, apiResponse.tags ) );

	return map( tags, tag => ( {
		id: tag.ID,
		displayName: decodeEntities( tag.display_name ),
		url: `/tag/${ tag.slug }`,
		title: decodeEntities( tag.title ),
		slug: tag.slug.toLowerCase(),
	} ) );
}
