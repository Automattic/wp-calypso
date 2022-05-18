import getUserSetting from 'calypso/state/selectors/get-user-setting';

describe( 'getUserSetting()', () => {
	test( 'should return null if neither server nor local unsaved settings contain the key', () => {
		const setting = getUserSetting(
			{
				userSettings: {
					settings: false,
					unsavedSettings: {},
				},
			},
			'__unknown'
		);

		expect( setting ).toBeNull();
	} );

	test( 'should prefer an unsaved setting over the server one', () => {
		const setting = getUserSetting(
			{
				userSettings: {
					settings: { foo: 'bar' },
					unsavedSettings: { foo: 'unsavedBar' },
				},
			},
			'foo'
		);

		expect( setting ).toEqual( 'unsavedBar' );
	} );

	test( 'should ignore an unsaved setting if there is no server value for the same key', () => {
		const setting = getUserSetting(
			{
				userSettings: {
					settings: {},
					unsavedSettings: { foo: 'unsavedBar' },
				},
			},
			'foo'
		);

		expect( setting ).toBeNull();
	} );

	test( 'should return a server value if there is no unsaved one', () => {
		const setting = getUserSetting(
			{
				userSettings: {
					settings: { foo: 'bar' },
					unsavedSettings: {},
				},
			},
			'foo'
		);

		expect( setting ).toEqual( 'bar' );
	} );
} );
