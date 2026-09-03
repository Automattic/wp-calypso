import { WRITE_ON_FLOW, START_WRITING_FLOW, isWriteOnFlow } from '../flows';

describe( 'isWriteOnFlow', () => {
	test( 'returns true for the write-on flow', () => {
		expect( isWriteOnFlow( WRITE_ON_FLOW ) ).toBe( true );
	} );

	test( 'returns false for a different flow', () => {
		expect( isWriteOnFlow( START_WRITING_FLOW ) ).toBe( false );
	} );

	test( 'returns false for null', () => {
		expect( isWriteOnFlow( null ) ).toBe( false );
	} );
} );
