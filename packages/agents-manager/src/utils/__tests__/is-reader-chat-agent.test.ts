import {
	READER_CHAT_AGENT_IDS,
	isReaderChatAgent,
	isReaderChatHost,
} from '../is-reader-chat-agent';

describe( 'READER_CHAT_AGENT_IDS', () => {
	it( "includes 'reader-chat'", () => {
		expect( READER_CHAT_AGENT_IDS ).toContain( 'reader-chat' );
	} );

	it( "includes 'p2-reader-chat'", () => {
		expect( READER_CHAT_AGENT_IDS ).toContain( 'p2-reader-chat' );
	} );
} );

describe( 'isReaderChatAgent', () => {
	it( "returns `true` for 'reader-chat'", () => {
		expect( isReaderChatAgent( 'reader-chat' ) ).toBe( true );
	} );

	it( "returns `true` for 'p2-reader-chat'", () => {
		expect( isReaderChatAgent( 'p2-reader-chat' ) ).toBe( true );
	} );

	it( "returns `false` for 'orchestrator'", () => {
		expect( isReaderChatAgent( 'orchestrator' ) ).toBe( false );
	} );

	it( 'returns `false` for `undefined`', () => {
		expect( isReaderChatAgent( undefined ) ).toBe( false );
	} );

	it( 'returns `false` for an empty string', () => {
		expect( isReaderChatAgent( '' ) ).toBe( false );
	} );
} );

describe( 'isReaderChatHost', () => {
	const originalWindow = globalThis.window;

	afterEach( () => {
		globalThis.window = originalWindow;
	} );

	it( 'returns `false` when `window` is undefined (SSR)', () => {
		// @ts-expect-error - Mocking window
		delete globalThis.window;
		expect( isReaderChatHost() ).toBe( false );
	} );

	it( "returns `true` when `window.agentsManagerData.agentId` is 'reader-chat'", () => {
		globalThis.window = {
			...originalWindow,
			agentsManagerData: { agentId: 'reader-chat' },
		} as unknown as Window & typeof globalThis;
		expect( isReaderChatHost() ).toBe( true );
	} );

	it( "returns `true` when `window.agentsManagerData.agentId` is 'p2-reader-chat'", () => {
		globalThis.window = {
			...originalWindow,
			agentsManagerData: { agentId: 'p2-reader-chat' },
		} as unknown as Window & typeof globalThis;
		expect( isReaderChatHost() ).toBe( true );
	} );

	it( "returns `false` when `window.agentsManagerData.agentId` is 'orchestrator'", () => {
		globalThis.window = {
			...originalWindow,
			agentsManagerData: { agentId: 'orchestrator' },
		} as unknown as Window & typeof globalThis;
		expect( isReaderChatHost() ).toBe( false );
	} );

	it( 'returns `false` when `agentsManagerData` is missing', () => {
		globalThis.window = {
			...originalWindow,
			agentsManagerData: undefined,
		} as unknown as Window & typeof globalThis;
		expect( isReaderChatHost() ).toBe( false );
	} );
} );
