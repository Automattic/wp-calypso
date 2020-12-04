/**
 * Internal dependencies
 */
import { fetchPostGeoImageUrl, receiveSuccess } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { receivePostGeoImageUrl, requestPostGeoImageUrl } from 'calypso/state/posts/geo/actions';

const successfulPostGeoMapResponse = {
	map_url: 'https://google',
	latitude: 12.121212,
	longitude: 123.123123,
};

describe( '#fetchPostGeoImageUrl', () => {
	test( 'should dispatch HTTP request to post map url endpoint', () => {
		const action = requestPostGeoImageUrl( 12345678, 10, 12.121212, 123.123123 );

		expect( fetchPostGeoImageUrl( action ) ).toMatchObject(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: '/sites/12345678/posts/10/map-url',
					query: {
						latitude: 12.121212,
						longitude: 123.123123,
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch HTTP request to post map url endpoint when Post ID is null', () => {
		const action = requestPostGeoImageUrl( 12345678, null, 12.121212, 123.123123 );

		expect( fetchPostGeoImageUrl( action ) ).toMatchObject(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: '/sites/12345678/posts/map-url',
					query: {
						latitude: 12.121212,
						longitude: 123.123123,
					},
				},
				action
			)
		);
	} );
} );

describe( '#receiveSuccess', () => {
	test( 'should dispatch `receivePostGeoImageUrl`', () => {
		const action = requestPostGeoImageUrl( 12345678, 10, 12.121212, 123.123123 );

		expect( receiveSuccess( action, successfulPostGeoMapResponse ) ).toEqual(
			receivePostGeoImageUrl( {
				siteId: 12345678,
				postId: 10,
				...successfulPostGeoMapResponse,
			} )
		);
	} );
} );
