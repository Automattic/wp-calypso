/**
 * Tests for session utilities
 */
import { select } from '@wordpress/data';
import { getSessionId } from './session';

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	createReduxStore: jest.fn( ( storeName: string ) => ( { name: storeName } ) ),
	register: jest.fn(),
} ) );

const mockSelect = select as jest.MockedFunction< typeof select >;

describe( 'getSessionId', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the session ID held in the store', () => {
		mockSelect.mockReturnValue( {
			getSessionId: () => 'session-for-the-open-image',
		} as never );

		expect( getSessionId() ).toBe( 'session-for-the-open-image' );
	} );

	it( 'returns an empty string when the store is not registered', () => {
		mockSelect.mockReturnValue( undefined as never );

		expect( getSessionId() ).toBe( '' );
	} );

	it( 'returns an empty string when selecting from the store throws', () => {
		mockSelect.mockImplementation( () => {
			throw new Error( 'Store "image-studio" is not registered' );
		} );

		expect( getSessionId() ).toBe( '' );
	} );
} );
