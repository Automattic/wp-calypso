describe( 'Redux tracking middleware', () => {
	afterEach( () => {
		delete window._currentSiteId;
		delete window._currentSiteType;
	} );

	test( 'returns null when the requested data store is unavailable', () => {
		window._currentSiteId = 1;
		window._currentSiteType = 'simple';

		jest.isolateModules( () => {
			require( '../tracking' );
			const { dispatch } = require( '@wordpress/data' );

			expect( dispatch( 'core/edit-post' ) ).toBeNull();
		} );
	} );
} );
