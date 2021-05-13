/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_VERTICALS_SET } from 'calypso/state/action-types';

describe( 'state/signup/verticals/reducer', () => {
	test( 'should default to an empty object', () => {
		expect( reducer( undefined, {} ) ).toEqual( {} );
	} );

	test( 'should associate a trimmed and lowercase search string to the verticals array.', () => {
		const search = 'Foo';
		const siteType = 'business';
		const verticals = [
			{ id: 0, verticalName: 'Coffee' },
			{ id: 1, verticalName: 'Tea' },
		];

		expect(
			reducer( undefined, {
				type: SIGNUP_VERTICALS_SET,
				search,
				siteType,
				verticals,
			} )
		).toEqual( {
			business: {
				foo: verticals,
			},
		} );
	} );
} );
