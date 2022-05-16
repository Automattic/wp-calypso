import { getSiteTitle } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSiteTitle( { signup: undefined } ) ).toEqual( '' );
	} );

	test( 'should return Site Title from the state', () => {
		expect(
			getSiteTitle( {
				signup: {
					steps: {
						siteTitle: 'Site Title',
					},
				},
			} )
		).toEqual( 'Site Title' );
	} );
} );
