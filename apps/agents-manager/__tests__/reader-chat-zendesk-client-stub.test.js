import { useGetZendeskConversations } from '../reader-chat-zendesk-client-stub';

describe( 'reader-chat-zendesk-client-stub', () => {
	it( 'returns the same settled, empty conversation list on every call', () => {
		const first = useGetZendeskConversations( true, 'key', 1 );
		const second = useGetZendeskConversations( true, 'key', 1 );

		expect( first ).toEqual( { conversations: [], isLoading: false } );
		expect( second.conversations ).toBe( first.conversations );
	} );
} );
