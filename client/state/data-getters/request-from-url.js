/**
 * Internal dependencies
 */
import { http as rawHttp } from 'calypso/state/http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';

/**
 * Fetches content from a URL with a GET request
 *
 * @example
 * waitForHttpData( () => ( {
 *     planets: requestFromUrl( 'https://swapi.co/api/planets/' ),
 * } ) ).then( ( { planets } ) => {
 *     console.log( planets.data );
 * } );
 *
 * @param {string} url location from which to GET data
 * @returns {object} HTTP data wrapped value
 */
const requestFromUrl = ( url ) =>
	requestHttpData( `get-at-url-${ url }`, rawHttp( { method: 'GET', url } ), {
		fromApi: () => ( data ) => [ [ `get-at-url-${ url }`, data ] ],
	} );

export default requestFromUrl;
