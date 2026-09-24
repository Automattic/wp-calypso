/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { SMOOCH_APP_ID, WIDGET_URL } from '../src/constants';
import { useGetZendeskConversationHistory } from '../src/use-get-zendesk-conversation-history';
import type { ReactNode } from 'react';

jest.mock( 'smooch', () => ( {} ) );

jest.mock( '../src/use-authenticate-zendesk-messaging', () => ( {
	fetchMessagingAuth: jest.fn( () => Promise.resolve( { jwt: 'the-jwt' } ) ),
} ) );

jest.mock( '../src/use-get-unread-conversations', () => ( {
	useGetUnreadConversations: () => jest.fn(),
} ) );

jest.mock( '../src/util', () => ( {
	isTestModeEnvironment: () => false,
	isCsatTriggerMessage: () => false,
	isZendeskSurveyMessage: () => false,
} ) );

const fetchMock = jest.fn();
const originalFetch = globalThis.fetch;

const rawMessage = ( id: string, received: number, role = 'appMaker' ) => ( {
	_id: id,
	role,
	name: role === 'appUser' ? 'Kathy' : 'Nath',
	authorId: 'author-1',
	type: 'text',
	text: id,
	received,
} );

const page = ( messages: ReturnType< typeof rawMessage >[], hasPrevious: boolean ) => ( {
	ok: true,
	json: () => Promise.resolve( { messages, hasPrevious } ),
} );

function renderHistoryHook() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	return renderHook( () => useGetZendeskConversationHistory(), { wrapper } ).result.current;
}

describe( 'useGetZendeskConversationHistory', () => {
	beforeEach( () => {
		fetchMock.mockReset();
		globalThis.fetch = fetchMock as unknown as typeof fetch;
	} );

	afterEach( () => {
		globalThis.fetch = originalFetch;
	} );

	it( 'follows `hasPrevious` back to the start and returns the messages oldest first', async () => {
		fetchMock
			.mockResolvedValueOnce(
				page( [ rawMessage( 'c', 30, 'appUser' ), rawMessage( 'd', 40 ) ], true )
			)
			.mockResolvedValueOnce( page( [ rawMessage( 'a', 10 ), rawMessage( 'b', 20 ) ], false ) );

		const getHistory = renderHistoryHook();
		const messages = await getHistory( { conversationId: 'conv-1', before: 50, clientId: 'c-1' } );

		expect( fetchMock ).toHaveBeenCalledTimes( 2 );
		expect( fetchMock.mock.calls[ 0 ][ 0 ] ).toBe(
			`${ WIDGET_URL }/sc/sdk/v2/apps/${ SMOOCH_APP_ID }/conversations/conv-1/messages?before=50`
		);
		expect( fetchMock.mock.calls[ 0 ][ 1 ].headers ).toMatchObject( {
			Authorization: 'Bearer the-jwt',
			'x-smooch-clientid': 'c-1',
		} );
		expect( fetchMock.mock.calls[ 1 ][ 0 ] ).toMatch( /messages\?before=30$/ );

		expect( messages.map( ( message ) => message.id ) ).toEqual( [ 'a', 'b', 'c', 'd' ] );
		expect( messages[ 2 ] ).toMatchObject( {
			role: 'user',
			displayName: 'Kathy',
			userId: 'author-1',
		} );
		expect( messages[ 3 ] ).toMatchObject( { role: 'business', displayName: 'Nath' } );
	} );

	it( 'rejects when the API responds with an error', async () => {
		fetchMock.mockResolvedValueOnce( { ok: false, status: 401 } );

		const getHistory = renderHistoryHook();

		await expect( getHistory( { conversationId: 'conv-1', before: 50 } ) ).rejects.toThrow( '401' );
	} );
} );
