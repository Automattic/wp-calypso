/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestVerticals, storeVerticals, showVerticalsRequestError } from '../';
import { setVerticals } from 'state/signup/verticals/actions';
import { NOTICE_CREATE } from 'state/action-types';

describe( 'data-layer/wpcom/signup/verticals', () => {
	test( 'requestVerticals()', () => {
		const mockAction = {
			search: 'Foo',
			limit: 7,
		};

		expect( requestVerticals( mockAction ) ).toEqual(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: '/verticals',
					query: {
						search: mockAction.search,
						limit: mockAction.limit,
						include_preview: true,
					},
				},
				mockAction
			)
		);
	} );

	test( 'storeVerticals()', () => {
		const search = 'Profit!';
		const verticals = [
			{ id: 0, verticalName: 'More Profit!' },
			{ id: 1, verticalName: 'Superfluous Profit!' },
		];

		expect( storeVerticals( { search }, verticals ) ).toEqual( setVerticals( search, verticals ) );
	} );

	test( 'showVerticalsRequestError()', () => {
		const errorNotice = showVerticalsRequestError();

		expect( errorNotice.type ).toEqual( NOTICE_CREATE );
		expect( errorNotice.notice.status ).toEqual( 'is-error' );
	} );
} );
