import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';

describe( 'getMagicLoginCurrentView()', () => {
	test( 'should return null if there is no information yet', () => {
		const isShowing = getMagicLoginCurrentView( undefined );
		expect( isShowing ).toBeNull();
	} );

	test( 'should return the current view if set', () => {
		const isShowing = getMagicLoginCurrentView( {
			login: {
				magicLogin: {
					currentView: 'some random view',
				},
			},
		} );
		expect( isShowing ).toEqual( 'some random view' );
	} );
} );
