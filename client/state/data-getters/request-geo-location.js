import { requestHttpData } from 'calypso/state/data-layer/http-data';
import { http as rawHttp } from 'calypso/state/http/actions';

const requestGeoLocation = () =>
	requestHttpData(
		'geo',
		rawHttp( {
			method: 'GET',
			url: 'https://public-api.wordpress.com/geo/',
		} ),
		{ fromApi: () => ( { body: { country_short } } ) => [ [ 'geo', country_short ] ] }
	);

export default requestGeoLocation;
