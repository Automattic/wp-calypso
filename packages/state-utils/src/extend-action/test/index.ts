/**
 * Internal dependencies
 */
import extendAction from '..';

describe( 'extendAction()', () => {
	test( 'should return an updated action object, merging data', () => {
		const action = extendAction(
			{
				type: 'ACTION_TEST',
				meta: {
					preserve: true,
				},
			},
			{
				meta: {
					ok: true,
				},
			}
		);

		expect( action ).toEqual( {
			type: 'ACTION_TEST',
			meta: {
				preserve: true,
				ok: true,
			},
		} );
	} );

	test( 'should return an updated action thunk, merging data on dispatch', () => {
		const dispatch = jest.fn();
		const action = extendAction(
			( thunkDispatch ) =>
				thunkDispatch( {
					type: 'ACTION_TEST',
					meta: {
						preserve: true,
					},
				} ),
			{
				meta: {
					ok: true,
				},
			}
		);

		action( dispatch );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'ACTION_TEST',
			meta: {
				preserve: true,
				ok: true,
			},
		} );
	} );

	test( 'should return an updated action thunk, accepting also getState', () => {
		const dispatch = jest.fn();
		const getState = () => ( { selectedSiteId: 42 } );

		const action = extendAction(
			( thunkDispatch, thunkGetState ) =>
				thunkDispatch( {
					type: 'ACTION_TEST',
					siteId: thunkGetState().selectedSiteId,
					meta: {
						preserve: true,
					},
				} ),
			{
				meta: {
					ok: true,
				},
			}
		);

		action( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'ACTION_TEST',
			siteId: 42,
			meta: {
				preserve: true,
				ok: true,
			},
		} );
	} );

	test( 'should return an updated nested action thunk, merging data on dispatch', () => {
		const dispatch = jest.fn();
		const action = extendAction(
			( thunkDispatch ) =>
				thunkDispatch( ( nestedThunkDispatch ) =>
					nestedThunkDispatch( {
						type: 'ACTION_TEST',
						meta: {
							preserve: true,
						},
					} )
				),
			{
				meta: {
					ok: true,
				},
			}
		);

		action( dispatch );
		dispatch.mock.calls[ 0 ][ 0 ]( dispatch );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'ACTION_TEST',
			meta: {
				preserve: true,
				ok: true,
			},
		} );
	} );
} );
