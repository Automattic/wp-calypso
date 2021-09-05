import { SIGNUP_STEPS_SITE_STYLE_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	test( 'should update the site style', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_SITE_STYLE_SET,
					siteStyle: 'prodigious-gravy',
				}
			)
		).toEqual( 'prodigious-gravy' );
	} );
} );
