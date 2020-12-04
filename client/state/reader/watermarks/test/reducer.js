/**
 * Internal dependencies
 */
import { viewStream } from '../actions';
import { watermarks } from '../reducer';
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';

jest.mock( 'lib/warn', () => () => {} );

const streamKey = 'special-chicken-stream';
const mark = Date.now();

describe( '#watermarks', () => {
	test( 'defaults to empty object', () => {
		expect( watermarks( undefined, { type: 'INIT' } ) ).toEqual( {} );
	} );

	test( 'can add a new stream to empty state', () => {
		const action = viewStream( { streamKey, mark } );
		expect( watermarks( {}, action ) ).toEqual( {
			[ streamKey ]: mark,
		} );
	} );

	test( 'can update an existing stream', () => {
		const prevState = { [ streamKey ]: mark };
		const newMark = mark + 2;
		const action = viewStream( { streamKey, mark: newMark } );
		expect( watermarks( prevState, action ) ).toEqual( {
			[ streamKey ]: newMark,
		} );
	} );

	test( 'will reject an attempt to update to an older mark', () => {
		const prevState = { [ streamKey ]: mark };
		const newMark = mark - 2;
		const action = viewStream( { streamKey, mark: newMark } );
		expect( watermarks( prevState, action ) ).toEqual( {
			[ streamKey ]: mark,
		} );
	} );

	test( 'will skip deserializing invalid marks', () => {
		const invalidState = { [ streamKey ]: 'invalid' };
		expect( watermarks( invalidState, { type: DESERIALIZE } ) ).toEqual( {} );
	} );

	test( 'will deserialize valid mark', () => {
		const validState = { [ streamKey ]: 42 };
		expect( watermarks( validState, { type: DESERIALIZE } ) ).toEqual( validState );
	} );

	test( 'will serialize', () => {
		const validState = { [ streamKey ]: 42 };
		expect( watermarks( validState, { type: SERIALIZE } ).root() ).toEqual( validState );
	} );
} );
