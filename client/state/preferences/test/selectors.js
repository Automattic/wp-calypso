import { isFetchingPreferences, getPreference, hasReceivedRemotePreferences } from '../selectors';

describe( 'selectors', () => {
	describe( 'isFetchingPreferences()', () => {
		test( 'should return preferences fetching status', () => {
			const state = { preferences: { fetching: true } };
			expect( isFetchingPreferences( state ) ).toEqual( true );
		} );
	} );

	describe( 'getPreference()', () => {
		test( 'should return null if none of local, remote, or default values contains key', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {},
						remoteValues: {},
					},
				},
				'__unknown'
			);

			expect( preference ).toBeNull();
		} );

		test( 'should return a default value if neither local nor remote values contain key', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {},
						remoteValues: {},
					},
				},
				'recentSites'
			);

			expect( preference ).toEqual( [] );
		} );

		test( 'should return the remote value if local does not contain key', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {},
						remoteValues: {
							foo: 'baz',
						},
					},
				},
				'foo'
			);

			expect( preference ).toEqual( 'baz' );
		} );

		test( 'should prefer a local value over remote or default values', () => {
			const preference = getPreference(
				{
					preferences: {
						localValues: {
							foo: 'qux',
						},
						remoteValues: {
							foo: 'baz',
						},
					},
				},
				'foo'
			);

			expect( preference ).toEqual( 'qux' );
		} );
	} );

	describe( 'hasReceivedRemotePreferences()', () => {
		test( 'should return false if preferences have not yet been received', () => {
			const hasReceived = hasReceivedRemotePreferences( {
				preferences: {
					remoteValues: null,
				},
			} );

			expect( hasReceived ).toBe( false );
		} );

		test( 'should return false if preferences have been received', () => {
			const hasReceived = hasReceivedRemotePreferences( {
				preferences: {
					remoteValues: {},
				},
			} );

			expect( hasReceived ).toBe( true );
		} );
	} );
} );
