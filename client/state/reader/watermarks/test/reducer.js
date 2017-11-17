/** @format */

/**
 * Internal dependencies
 */
import { viewStream } from '../actions';
import { watermarks } from '../reducer';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';

jest.mock( 'lib/warn', () => () => {} );

const streamId = 'special-chicken-stream';
const mark = Date.now();

describe( '#watermarks', () => {
	test( 'defaults to empty object', () => {
		expect( watermarks( undefined, { type: 'INIT' } ) ).toEqual( {} );
	} );

	test( 'can add a new stream to empty state', () => {
		const action = viewStream( { streamId, mark } );
		expect( watermarks( {}, action ) ).toEqual( {
			[ streamId ]: mark,
		} );
	} );

	test( 'can update an existing stream', () => {
		const prevState = { [ streamId ]: mark };
		const newMark = mark + 2;
		const action = viewStream( { streamId, mark: newMark } );
		expect( watermarks( prevState, action ) ).toEqual( {
			[ streamId ]: newMark,
		} );
	} );

	test( 'will reject an attempt to update to an older mark', () => {
		const prevState = { [ streamId ]: mark };
		const newMark = mark - 2;
		const action = viewStream( { streamId, mark: newMark } );
		expect( watermarks( prevState, action ) ).toEqual( {
			[ streamId ]: mark,
		} );
	} );

	test( 'will skip deserializing invalid marks', () => {
		const invalidState = { [ streamId ]: 'invalid' };
		expect( watermarks( invalidState, { type: DESERIALIZE } ) ).toEqual( {} );
	} );

	test( 'will deserialize valid mark', () => {
		const validState = { [ streamId ]: 42 };
		expect( watermarks( validState, { type: DESERIALIZE } ) ).toEqual( validState );
	} );

	test( 'will serialize', () => {
		const validState = { [ streamId ]: 42 };
		expect( watermarks( validState, { type: SERIALIZE } ) ).toEqual( validState );
	} );
} );
