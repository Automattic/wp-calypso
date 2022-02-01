import isPrecancellationChatAvailable from '../is-precancellation-chat-available';

describe( '#isPrecancellationChatAvailable()', () => {
	test( 'should return false if cancellation chat is not available', () => {
		const isPrecancellationAvailable = isPrecancellationChatAvailable( {
			happychat: {
				user: {
					availability: {
						precancellation: false,
					},
				},
			},
		} );
		expect( isPrecancellationAvailable ).toBe( false );
	} );
	test( 'should return true if cancellation chat is available', () => {
		const isPrecancellationAvailable = isPrecancellationChatAvailable( {
			happychat: {
				user: {
					availability: {
						precancellation: true,
					},
				},
			},
		} );
		expect( isPrecancellationAvailable ).toBe( true );
	} );
} );
