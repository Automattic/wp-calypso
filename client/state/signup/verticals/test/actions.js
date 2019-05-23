/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_VERTICALS_REQUEST, SIGNUP_VERTICALS_SET } from 'state/action-types';
import { requestVerticals, setVerticals } from '../actions';

describe( 'state/signup/verticals/actions', () => {
	test( 'requestVerticals', () => {
		const search = 'Foo',
			siteTypeId = 2,
			limit = 7;

		expect( requestVerticals( search, siteTypeId, limit ) ).toEqual( {
			type: SIGNUP_VERTICALS_REQUEST,
			search,
			siteTypeId,
			limit,
		} );
	} );

	test( 'setVerticals', () => {
		const search = 'Foo';
		const siteTypeId = 3;
		const verticals = [
			{ id: 0, verticalName: 'vertical 1' },
			{ id: 1, verticalName: 'vertical 2' },
		];

		expect( setVerticals( search, siteTypeId, verticals ) ).toEqual( {
			type: SIGNUP_VERTICALS_SET,
			search,
			siteTypeId,
			verticals,
		} );
	} );
} );
