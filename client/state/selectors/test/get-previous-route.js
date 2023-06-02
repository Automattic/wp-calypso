import getPreviousRoute from 'calypso/state/selectors/get-previous-route';

describe( 'getPreviousRoute()', () => {
	test( 'should return empty if the previous Route is not set', () => {
		const stateIn = {};
		const output = getPreviousRoute( stateIn );
		expect( output ).toEqual( '' );
	} );

	test( 'should return previous route if one is found', () => {
		const stateIn = {
			route: {
				path: {
					previous: '/hello',
				},
				query: {
					previous: {
						filter: 'hello',
					},
				},
			},
		};
		const output = getPreviousRoute( stateIn );
		expect( output ).toEqual( '/hello?filter=hello' );
	} );
} );
