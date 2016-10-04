/**
 * External dependencies
 */
import { get } from 'lodash';

export function isRequestingGeo( state ) {
	return state.geo.requesting;
}

export function getGeo( state ) {
	return state.geo.geo;
}

export function getGeoCountry( state ) {
	return get( getGeo( state ), 'country_long', null );
}
