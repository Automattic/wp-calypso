/** @format */
/**
 * Internal dependencies
 */
import { HTTP_DATA_REQUEST, HTTP_DATA_TICK } from 'state/action-types';

export const reducer = ( state = 0, { type } ) => ( HTTP_DATA_TICK === type ? state + 1 : state );

export const httpData = new Map();

export const update = ( id, state, data ) => {
	const lastUpdated = Date.now();
	const item = httpData.get( id );

	switch ( state ) {
		case 'failure':
			return httpData.set(
				id,
				undefined !== item
					? { state, error: data, data: item.data, lastUpdated }
					: { state, error: data, lastUpdated }
			);

		case 'pending':
			return httpData.set(
				id,
				undefined !== item
					? { state, data: item.data, lastUpdated: item.lastUpdated, pendingSince: lastUpdated }
					: { state, pendingSince: lastUpdated }
			);

		case 'success':
			return httpData.set( id, { state, data, lastUpdated } );
	}
};

export const requestHttpData = ( id, action, { fromApi } ) =>
	'function' === typeof fromApi
		? { type: HTTP_DATA_REQUEST, id, fetch: action, fromApi }
		: { type: HTTP_DATA_REQUEST, id, fetch: action };

const empty = Object.freeze( Object.create( null ) );
export const getHttpData = id => httpData.get( id ) || empty;

window.httpData = httpData;
window.getHttpData = getHttpData;
window.requestHttpData = requestHttpData;
