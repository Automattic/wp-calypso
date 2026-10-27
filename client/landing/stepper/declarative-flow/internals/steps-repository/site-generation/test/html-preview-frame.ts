import { isPreviewFrameStatus } from '../stream/html-preview-frame';

describe( 'isPreviewFrameStatus', () => {
	const tour = ( title: unknown ) => ( { v: 1, channel: 'c', type: 'tour', title } );

	it( 'accepts a walked page title up to 100 characters, or none', () => {
		expect( isPreviewFrameStatus( tour( null ), 'c' ) ).toBe( true );
		expect( isPreviewFrameStatus( tour( 'a'.repeat( 100 ) ), 'c' ) ).toBe( true );
	} );

	it( 'rejects longer or non-string titles and other channels', () => {
		expect( isPreviewFrameStatus( tour( 'a'.repeat( 101 ) ), 'c' ) ).toBe( false );
		expect( isPreviewFrameStatus( tour( 42 ), 'c' ) ).toBe( false );
		expect( isPreviewFrameStatus( tour( 'Menu' ), 'other' ) ).toBe( false );
	} );
} );
