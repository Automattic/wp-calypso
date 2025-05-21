import { type RequestHandler } from 'express';

/**
 * Adds the `x-geoip-country-code` header to the request. This is used to simulate the header added
 * in production environments, which is not available in all environments.
 * @returns A middleware function that adds the `x-geoip-country-code` header to the request.
 */
export default function (): RequestHandler {
	// To avoid delays on handling individual requests, fetch the geolocation once at server
	// startup. This will retrieve the geolocation of the server (not the client), but it's
	// expected that the middleware would be enabled on a developer's own machine.
	const getGeoCountryCode = ( () => {
		let countryCode: string | undefined;
		let countryCodePromise: Promise< string | undefined > | undefined;

		return async () => {
			if ( ! countryCode ) {
				if ( ! countryCodePromise ) {
					countryCodePromise = fetch( 'https://public-api.wordpress.com/geo/' )
						.then( async ( response ) => response.json() )
						.then( ( { country_short } ) => country_short )
						// Support offline development and set an expectation that the header is not
						// always available by quietly skipping if the request fails.
						.catch( () => {
							// Reset the promise so we can try again on the next request
							countryCodePromise = undefined;
							return undefined;
						} );
				}

				countryCode = await countryCodePromise;
			}

			return countryCode;
		};
	} )();

	// Prime the cache when the middleware is initialized.
	getGeoCountryCode();

	return async ( req, _res, next ) => {
		const countryCode = await getGeoCountryCode();
		if ( countryCode ) {
			req.headers[ 'x-geoip-country-code' ] = countryCode;
		}

		next();
	};
}
