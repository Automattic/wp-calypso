/**
 * External dependencies
 */
import { range } from 'lodash';

/**
 * Internal dependencies
 */
import { serially } from 'state/media/thunks/serially';
import * as dateUtils from 'state/media/utils/transient-date';

describe( 'serially', () => {
	const innerThunk = jest.fn();
	const mediaAddingAction = jest.fn( ( ...args ) => () => innerThunk( ...args ) );
	const wrapped = serially( mediaAddingAction );
	const dispatch = jest.fn( ( fn ) => fn() );
	const extraArg1 = Symbol( 'extra arg 1' );
	const extraArg2 = Symbol( 'extra arg 2' );

	const constantBaseTime = dateUtils.getBaseTime();

	beforeEach( () => {
		// force a constant base time so we can call `getTransientDate` with controlled values
		const getBaseTime = jest.spyOn( dateUtils, 'getBaseTime' );
		getBaseTime.mockReturnValue( constantBaseTime );
		mediaAddingAction.mockClear();
	} );

	const files = range( 3 ).map( ( i ) => Symbol( `file${ i }` ) );

	it( 'should call the media adding action for each file', async () => {
		await wrapped( files, extraArg1, extraArg2 )( dispatch );

		expect( mediaAddingAction ).toHaveBeenCalledTimes( 3 );
		files.forEach( ( theFile, index ) => {
			expect( mediaAddingAction ).toHaveBeenCalledWith(
				theFile,
				extraArg1,
				extraArg2,
				dateUtils.getTransientDate( constantBaseTime, index, files.length )
			);
		} );
	} );

	it( 'should not fail all the uploads if one of them fails', async () => {
		innerThunk.mockResolvedValueOnce( 1 ).mockRejectedValueOnce( 2 ).mockResolvedValueOnce( 3 );

		await expect( wrapped( files, extraArg1, extraArg2 )( dispatch ) ).resolves.toEqual( 3 );

		expect( mediaAddingAction ).toHaveBeenCalledTimes( 3 );
	} );
} );
