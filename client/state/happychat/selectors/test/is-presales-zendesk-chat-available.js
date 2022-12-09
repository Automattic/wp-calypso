import isPresalesZendeskChatAvailable from '../is-presales-zendesk-chat-available';

describe( '#isPresalesZendeskChatAvailable()', () => {
	test( 'should return false if presales zendesk chat is not available', () => {
		const isPresaleZendeskAvailable = isPresalesZendeskChatAvailable( {
			happychat: {
				user: {
					availability: {
						presale_zendesk: false,
					},
				},
			},
		} );
		expect( isPresaleZendeskAvailable ).toBe( false );
	} );
	test( 'should return true if presales zendesk chat is available', () => {
		const isPresaleZendeskAvailable = isPresalesZendeskChatAvailable( {
			happychat: {
				user: {
					availability: {
						presale_zendesk: true,
					},
				},
			},
		} );
		expect( isPresaleZendeskAvailable ).toBe( true );
	} );
} );
