/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestVerticals, storeVerticals, showVerticalsRequestError } from '../';
import { setVerticals } from 'calypso/state/signup/verticals/actions';
import { NOTICE_CREATE } from 'calypso/state/action-types';

describe( 'data-layer/wpcom/signup/verticals', () => {
	test( 'requestVerticals()', () => {
		const mockAction = {
			search: 'Foo',
			siteTypeId: 1,
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
						site_type: mockAction.siteTypeId,
						limit: mockAction.limit,
						include_preview: true,
						allow_synonyms: true,
					},
				},
				mockAction
			)
		);
	} );

	test( 'requestVerticals() with missing siteTypeId', () => {
		const mockAction = {
			search: 'Foo',
			limit: 7,
		};

		expect( requestVerticals( mockAction ) ).not.toHaveProperty( 'query.site_type' );
	} );

	test( 'storeVerticals()', () => {
		const search = 'Profit!';
		const siteType = 'business';
		const verticals = [
			{ id: 0, verticalName: 'More Profit!' },
			{ id: 1, verticalName: 'Superfluous Profit!' },
		];

		expect( storeVerticals( { search }, verticals ) ).toEqual(
			setVerticals( search, '', verticals )
		);
		expect( storeVerticals( { search, siteType }, verticals ) ).toEqual(
			setVerticals( search, siteType, verticals )
		);
	} );

	test( 'showVerticalsRequestError()', () => {
		const errorNotice = showVerticalsRequestError();

		expect( errorNotice.type ).toEqual( NOTICE_CREATE );
		expect( errorNotice.notice.status ).toEqual( 'is-error' );
	} );
} );
