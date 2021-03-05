/**
 * External dependencies
 */
import { keyBy, map, unescape } from 'lodash';

const convertZone = ( zone ) => ( {
	description: unescape( zone.description ),
	id: zone.term_id,
	name: unescape( zone.name ),
	slug: zone.slug,
} );

export const zoneFromApi = ( response ) => convertZone( response.data );
export const zonesListFromApi = ( response ) => keyBy( map( response.data, convertZone ), 'id' );
