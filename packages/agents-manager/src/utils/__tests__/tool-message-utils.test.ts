import { getRetryingToolCallId } from '../tool-message-utils';

describe( 'getRetryingToolCallId', () => {
	it( 'reads the retried tool call from a progress part', () => {
		expect(
			getRetryingToolCallId( {
				parts: [
					{
						type: 'data',
						data: { summary: 'Adjusting my approach…', retryingToolCallId: 'tool-call-1' },
					},
				],
			} )
		).toBe( 'tool-call-1' );
	} );

	it( 'ignores progress parts without a retry', () => {
		expect(
			getRetryingToolCallId( {
				parts: [ { type: 'data', data: { summary: 'Editing the page…' } } ],
			} )
		).toBeUndefined();
	} );

	it( 'ignores messages without parts', () => {
		expect( getRetryingToolCallId( undefined ) ).toBeUndefined();
		expect( getRetryingToolCallId( { parts: 'nope' } ) ).toBeUndefined();
	} );
} );
