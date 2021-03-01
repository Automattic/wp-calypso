/**
 * Internal dependencies
 */
import { setRoute } from '../actions';
import { ROUTE_SET } from 'calypso/state/action-types';

describe( 'setRoute()', () => {
	const route = '/foo';

	test( 'should return an action with an empty query object if no query is supplied', () => {
		const action = setRoute( route );

		expect( action ).toEqual( {
			type: ROUTE_SET,
			path: route,
			query: {},
		} );
	} );

	test( 'should return an action object with path and the specified query arguments', () => {
		const query = {
			foo: 'bar',
			bat: 123,
		};
		const action = setRoute( route, query );

		expect( action ).toEqual( {
			type: ROUTE_SET,
			path: route,
			query,
		} );
	} );
} );
