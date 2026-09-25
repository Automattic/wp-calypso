import {
	WRITE_ON_FLOW,
	START_WRITING_FLOW,
	VIDEOPRESS_CHANNEL_FLOW,
	isWriteOnFlow,
	isVideoPressChannelFlow,
} from '../flows';

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

describe( 'isVideoPressChannelFlow', () => {
	test( 'returns true for the videopress-channel flow', () => {
		expect( isVideoPressChannelFlow( VIDEOPRESS_CHANNEL_FLOW ) ).toBe( true );
	} );

	test( 'returns false for a different flow', () => {
		expect( isVideoPressChannelFlow( WRITE_ON_FLOW ) ).toBe( false );
	} );

	test( 'returns false for null', () => {
		expect( isVideoPressChannelFlow( null ) ).toBe( false );
	} );
} );
