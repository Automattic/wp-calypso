/**
 * Internal dependencies
 */
import { viewStream } from '../actions';
import { watermarks } from '../reducer';
import { serialize, deserialize } from 'calypso/state/utils';

jest.mock( '@wordpress/warning', () => () => {} );

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
		expect( deserialize( watermarks, invalidState ) ).toEqual( {} );
	} );

	test( 'will deserialize valid mark', () => {
		const validState = { [ streamKey ]: 42 };
		expect( deserialize( watermarks, validState ) ).toEqual( validState );
	} );

	test( 'will serialize', () => {
		const validState = { [ streamKey ]: 42 };
		expect( serialize( watermarks, validState ).root() ).toEqual( validState );
	} );
} );
