/** @format */
/**
 * Internal dependencies
 */
import { http as rawHttp } from 'state/http/actions';
import { requestHttpData } from 'state/data-layer/http-data';

export const requestGeoLocation = () =>
	requestHttpData(
		'geo',
		rawHttp( {
			method: 'GET',
			url: 'https://public-api.wordpress.com/geo/',
		} ),
		{ fromApi: ( { body: { country_short } } ) => [ [ 'geo', parseInt( country_short, 10 ) ] ] }
	);
