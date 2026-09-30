/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import wpcomRequest from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../../context';
import { requestOdieStreamToken, streamWpcomOdieMessage } from '../stream-wpcom-odie-message';
import { useSendOdieMessage } from '../use-send-odie-message';
import type { Chat, Message, ReturnedChat } from '../../types';
import type { ReactNode } from 'react';

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );
jest.mock( '@automattic/zendesk-client', () => ( { isTestModeEnvironment: () => false } ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setLoggedOutOdieChat: jest.fn() } ),
	useSelect: () => ( { ID: 1 } ),
} ) );
jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { pathname: '/odie', search: '' } ),
	useNavigate: () => jest.fn(),
} ) );
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: () => true,
} ) );
jest.mock( '../../context', () => ( { useOdieAssistantContext: jest.fn() } ) );
jest.mock( '../../hooks', () => ( { useCreateZendeskConversation: () => jest.fn() } ) );
jest.mock( '../../hooks/use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( { isLoggedOutSession: false } ),
} ) );
jest.mock( '../../hooks/use-open-interaction-status-map', () => ( {
	useOpenInteractionStatusMap: () => ( {} ),
} ) );
jest.mock( '../../utils/get-bot-slug', () => ( {
	getBotSlug: () => 'wpcom-workflow-support_chat',
} ) );
jest.mock( '../../utils/get-open-live-interactions', () => ( {
	getOpenLiveInteractions: () => ( {} ),
} ) );
let mockCurrentInteraction: { uuid: string; bot_slug: string } | undefined;
const mockStartNewInteraction = jest.fn();

jest.mock( '../use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: mockCurrentInteraction } ),
} ) );
jest.mock( '..', () => ( {
	useManageSupportInteraction: () => ( {
		addEventToInteraction: jest.fn(),
		startNewInteraction: mockStartNewInteraction,
	} ),
} ) );
jest.mock( '../../utils', () => ( {
	...jest.requireActual( '../../utils' ),
	getOdieIdFromInteraction: ( interaction?: unknown ) => ( interaction ? 7 : undefined ),
} ) );
jest.mock( '../stream-wpcom-odie-message', () => ( {
	requestOdieStreamToken: jest.fn(),
	streamWpcomOdieMessage: jest.fn(),
} ) );

const userMessage = {
	content: 'How do I change my theme?',
	role: 'user',
	type: 'message',
} as Message;

const returnedChat = ( content: string ): ReturnedChat => ( {
	chat_id: 7,
	session_id: 'session-1',
	wpcom_user_id: 1,
	experiment_name: null,
	messages: [ { message_id: 99, content, role: 'bot', type: 'message', context: {} } as Message ],
} );

let chat: Chat;

async function send() {
	const queryClient = new QueryClient();
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
	const { result } = renderHook( () => useSendOdieMessage( new AbortController().signal ), {
		wrapper,
	} );

	await act( async () => {
		await result.current.mutateAsync( userMessage ).catch( () => null );
	} );
}

const botContents = () =>
	chat.messages
		.filter( ( message ) => message.role === 'bot' )
		.map( ( message ) => message.content );

describe( 'useSendOdieMessage with streaming enabled', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		chat = { messages: [ userMessage ], odieId: 7 } as Chat;
		mockCurrentInteraction = { uuid: 'interaction-1', bot_slug: 'wpcom-workflow-support_chat' };

		jest.mocked( useOdieAssistantContext ).mockReturnValue( {
			chat,
			isStreamingEnabled: true,
			isUserEligibleForPaidSupport: false,
			selectedSiteId: 1,
			setChat: ( update: Chat | ( ( previous: Chat ) => Chat ) ) => {
				chat = typeof update === 'function' ? update( chat ) : update;
			},
			setChatStatus: jest.fn(),
			setExperimentVariationName: jest.fn(),
			trackEvent: jest.fn(),
		} as unknown as ReturnType< typeof useOdieAssistantContext > );

		jest.mocked( requestOdieStreamToken ).mockResolvedValue( 'jwt' );
	} );

	it( 'shows the reply as it streams, then replaces it with the stored message', async () => {
		const seenWhileStreaming: unknown[][] = [];

		jest.mocked( streamWpcomOdieMessage ).mockImplementation( async ( _path, { onDelta } ) => {
			onDelta( 'To change ' );
			seenWhileStreaming.push( botContents() );
			onDelta( 'your theme…' );
			seenWhileStreaming.push( botContents() );
			return returnedChat( 'To change your theme…' );
		} );

		await send();

		expect( seenWhileStreaming ).toEqual( [ [ 'To change ' ], [ 'To change your theme…' ] ] );
		expect( botContents() ).toEqual( [ 'To change your theme…' ] );
		expect( chat.messages.at( -1 ) ).toMatchObject( { message_id: 99, role: 'bot' } );
		expect( wpcomRequest ).not.toHaveBeenCalled();
	} );

	it( 'keeps the streamed reply on screen while a new chat is registered as an interaction', async () => {
		mockCurrentInteraction = undefined;
		let shownWhileRegistering: unknown[] = [];
		mockStartNewInteraction.mockImplementation( async () => {
			shownWhileRegistering = botContents();
			return { uuid: 'interaction-2', bot_slug: 'wpcom-workflow-support_chat' };
		} );
		jest.mocked( streamWpcomOdieMessage ).mockImplementation( async ( _path, { onDelta } ) => {
			onDelta( 'To change your theme…' );
			return returnedChat( 'To change your theme…' );
		} );

		await send();

		expect( mockStartNewInteraction ).toHaveBeenCalled();
		expect( shownWhileRegistering ).toEqual( [ 'To change your theme…' ] );
		expect( botContents() ).toEqual( [ 'To change your theme…' ] );
	} );

	it( 'keeps the latest progress update until the next message is sent', async () => {
		let progressWhileStreaming: string | undefined;
		jest.mocked( streamWpcomOdieMessage ).mockImplementation( async ( _path, { onProgress } ) => {
			onProgress?.( 'Checking your theme settings.' );
			progressWhileStreaming = chat.progressMessage;
			return returnedChat( 'To change your theme…' );
		} );

		await send();

		expect( progressWhileStreaming ).toBe( 'Checking your theme settings.' );

		jest
			.mocked( streamWpcomOdieMessage )
			.mockImplementation( async () => returnedChat( 'Anything else?' ) );

		await send();

		expect( chat.progressMessage ).toBeUndefined();
	} );

	it( 'drops the partial reply when the stream fails', async () => {
		jest.mocked( streamWpcomOdieMessage ).mockImplementation( async ( _path, { onDelta } ) => {
			onDelta( 'To change ' );
			throw new Error( '500 model unavailable' );
		} );

		await send();

		expect( botContents() ).not.toContain( 'To change ' );
		expect( chat.messages.at( -1 )?.context?.flags?.is_error_message ).toBe( true );
	} );

	it( 'falls back to the proxied request when no token can be obtained', async () => {
		jest.mocked( requestOdieStreamToken ).mockResolvedValue( null );
		jest.mocked( wpcomRequest ).mockResolvedValue( returnedChat( 'Proxied reply' ) );

		await send();

		expect( streamWpcomOdieMessage ).not.toHaveBeenCalled();
		expect( wpcomRequest ).toHaveBeenCalledWith(
			expect.objectContaining( { path: '/odie/chat/wpcom-workflow-support_chat/7' } )
		);
		expect( botContents() ).toEqual( [ 'Proxied reply' ] );
	} );
} );
