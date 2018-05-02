/** @format */
/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import { http as rawHttp } from 'state/http/actions';
import { requestHttpData } from 'state/data-layer/http-data/common';

export const requestGeoLocation = () =>
	requestHttpData(
		'geo',
		rawHttp( {
			method: 'GET',
			url: 'https://public-api.wordpress.com/geo/',
		} ),
		{
			fromApi: makeJsonSchemaParser(
				{
					type: 'object',
					properties: {
						body: {
							type: [ 'object', 'null' ],
							properties: {
								latitude: { type: 'string' },
								longitude: { type: 'string' },
								country_short: { type: 'string' },
								country_long: { type: 'string' },
								region: { type: 'string' },
								city: { type: 'string' },
							},
						},
					},
				},
				// we only use the short code currently
				( { body: { country_short } } ) => [ [ 'geo', country_short ] ]
			),
		}
	);
