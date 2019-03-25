/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_VERTICALS_REQUEST, SIGNUP_VERTICALS_SET } from 'state/action-types';
import { requestVerticals, setVerticals } from '../actions';

describe( 'state/signup/verticals/actions', () => {
	test( 'requestVerticals', () => {
		const search = 'Foo',
			limit = 7;

		expect( requestVerticals( search, limit ) ).toEqual( {
			type: SIGNUP_VERTICALS_REQUEST,
			search,
			limit,
		} );
	} );

	test( 'setVerticals', () => {
		const search = 'Foo';
		const verticals = [
			{ id: 0, verticalName: 'vertical 1' },
			{ id: 1, verticalName: 'vertical 2' },
		];

		expect( setVerticals( search, verticals ) ).toEqual( {
			type: SIGNUP_VERTICALS_SET,
			search,
			verticals,
		} );
	} );
} );
