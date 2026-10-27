/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { useSendZendeskMessage } from '../use-send-zendesk-message';
import type { Message } from '../../types';
import type { ReactNode } from 'react';

jest.mock( 'smooch', () => ( {
	__esModule: true,
	default: {
		sendMessage: jest.fn(),
		getConversationById: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
	},
} ) );
jest.mock( '../../context', () => ( { useOdieAssistantContext: jest.fn() } ) );
jest.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: undefined } ),
} ) );
jest.mock( '../../utils', () => ( { getConversationIdFromInteraction: () => undefined } ) );

const TEMPORARY_ID = 'temporary-1';
const message = {
	content: 'Hello',
	role: 'user',
	type: 'message',
	metadata: { temporary_id: TEMPORARY_ID, local_timestamp: 1 },
} as Message;

type SentMessage = { metadata: { temporary_id: string } };
type StoredMessage = { id?: string; metadata: { temporary_id: string }; sendStatus?: string };

const sendMessage = jest.mocked( Smooch.sendMessage ) as unknown as jest.Mock;
let store: StoredMessage[];
let sentListeners: Set< ( message: StoredMessage ) => void >;

const delivered = ( temporaryId: string ): StoredMessage => ( {
	id: 'server-1',
	metadata: { temporary_id: temporaryId },
} );

// What Smooch does once the server accepts a message: it stores it, and reports it just after.
function deliver( sent: SentMessage, { notify = true } = {} ) {
	const stored = delivered( sent.metadata.temporary_id );
	store.push( stored );
	if ( notify ) {
		setTimeout( () => sentListeners.forEach( ( listener ) => listener( stored ) ), 5 );
	}
}

// What Smooch does when the request fails: it keeps the message, flagged, and resolves anyway.
function fail( sent: SentMessage ) {
	store.push( { metadata: { temporary_id: sent.metadata.temporary_id }, sendStatus: 'failed' } );
}

async function send() {
	const queryClient = new QueryClient( { defaultOptions: { mutations: { retryDelay: 0 } } } );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	const { result } = renderHook( () => useSendZendeskMessage( new AbortController().signal ), {
		wrapper,
	} );

	let sending: Promise< Message > | undefined;
	act( () => {
		sending = result.current.mutateAsync( message );
	} );
	await act( async () => {
		await jest.advanceTimersByTimeAsync( 20000 );
	} );
	return sending as Promise< Message >;
}

describe( 'useSendZendeskMessage', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		store = [];
		sentListeners = new Set();
		jest
			.mocked( Smooch.getConversationById )
			.mockImplementation( async () => ( { messages: store } ) as never );
		jest.mocked( Smooch.on ).mockImplementation( ( ( _event: string, listener: never ) => {
			sentListeners.add( listener );
		} ) as never );
		// @ts-expect-error -- 'off' is not part of the def.
		jest.mocked( Smooch.off ).mockImplementation( ( _event: string, listener: never ) => {
			sentListeners.delete( listener );
		} );
		jest.mocked( useOdieAssistantContext ).mockReturnValue( {
			chat: { conversationId: 'conversation-1', messages: [] },
			setChat: jest.fn(),
			trackEvent: jest.fn(),
		} as unknown as ReturnType< typeof useOdieAssistantContext > );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'posts the message once when the server is slow to answer', async () => {
		sendMessage.mockImplementation(
			( sent: SentMessage ) =>
				new Promise< void >( ( resolve ) =>
					setTimeout( () => {
						resolve();
						deliver( sent );
					}, 7000 )
				)
		);

		await expect( send() ).resolves.toMatchObject( { id: 'server-1' } );
		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'posts the message again when the previous attempt failed', async () => {
		sendMessage
			.mockImplementationOnce( async ( sent: SentMessage ) => fail( sent ) )
			.mockImplementationOnce( async ( sent: SentMessage ) => deliver( sent ) );

		await expect( send() ).resolves.toMatchObject( { id: 'server-1' } );
		expect( sendMessage ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not post a message that an earlier attempt already got through', async () => {
		store.push( delivered( TEMPORARY_ID ) );

		await expect( send() ).resolves.toMatchObject( { id: 'server-1' } );
		expect( sendMessage ).not.toHaveBeenCalled();
	} );

	it( 'counts a message the conversation has as sent, even without `message:sent`', async () => {
		sendMessage.mockImplementation( async ( sent: SentMessage ) =>
			deliver( sent, { notify: false } )
		);

		await expect( send() ).resolves.toMatchObject( { id: 'server-1' } );
		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'retries while Smooch is not initialized yet', async () => {
		sendMessage
			.mockRejectedValueOnce(
				new Error( 'Must initialize the Web Messenger first using `init()`.' )
			)
			.mockImplementationOnce( async ( sent: SentMessage ) => deliver( sent ) );

		await expect( send() ).resolves.toMatchObject( { id: 'server-1' } );
		expect( sendMessage ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'stops listening for `message:sent` once the message is sent', async () => {
		sendMessage.mockImplementation( async ( sent: SentMessage ) => deliver( sent ) );

		await send();
		expect( sentListeners.size ).toBe( 0 );
	} );
} );
