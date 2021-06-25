/**
 * Internal dependencies
 */
import { SIGNUP_VERTICALS_REQUEST, SIGNUP_VERTICALS_SET } from 'calypso/state/action-types';
import { requestVerticals, setVerticals } from '../actions';

describe( 'state/signup/verticals/actions', () => {
	test( 'requestVerticals', () => {
		const search = 'Foo';
		const siteType = 'Business';
		const limit = 7;

		expect( requestVerticals( search, siteType, limit ) ).toEqual( {
			type: SIGNUP_VERTICALS_REQUEST,
			search,
			siteType,
			limit,
		} );
	} );

	test( 'setVerticals', () => {
		const search = 'Foo';
		const siteType = 'Business';
		const verticals = [
			{ id: 0, verticalName: 'vertical 1' },
			{ id: 1, verticalName: 'vertical 2' },
		];

		expect( setVerticals( search, siteType, verticals ) ).toEqual( {
			type: SIGNUP_VERTICALS_SET,
			search,
			siteType,
			verticals,
		} );
	} );
} );
