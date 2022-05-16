import getPreviousPath from 'calypso/state/selectors/get-previous-path';

describe( 'getPreviousPath()', () => {
	test( 'should return empty if the previous path is not set', () => {
		const stateIn = {};
		const output = getPreviousPath( stateIn );
		expect( output ).toEqual( '' );
	} );

	test( 'should return previous path if one is found', () => {
		const stateIn = {
			route: {
				path: {
					previous: '/hello',
				},
			},
		};
		const output = getPreviousPath( stateIn );
		expect( output ).toEqual( '/hello' );
	} );
} );
