/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ), {
	virtual: true,
} );
jest.mock( '@wordpress/data', () => ( { select: jest.fn( () => ( {} ) ) } ) );
jest.mock( '../agent-session', () => ( { getSessionId: jest.fn( () => 'session-xyz' ) } ) );
jest.mock( '../is-reader-chat-agent', () => {
	const actual = jest.requireActual( '../is-reader-chat-agent' );
	return { ...actual, isReaderChatHost: jest.fn( () => false ) };
} );

import { select } from '@wordpress/data';
import { isReaderChatHost } from '../is-reader-chat-agent';
import { setResolvedAgentId } from '../resolved-agent-id';
import {
	getBigSkyTracksData,
	recordAgentsManagerTracksEvent,
	recordBigSkyTracksEvent,
} from '../tracks';

const mockRecordTracksEvent = recordTracksEvent as jest.MockedFunction< typeof recordTracksEvent >;
const mockIsReaderChatHost = isReaderChatHost as jest.MockedFunction< typeof isReaderChatHost >;
const mockSelect = select as jest.MockedFunction< typeof select >;

function lastEventProps(): Record< string, unknown > {
	const call = mockRecordTracksEvent.mock.calls.at( -1 );
	return ( call?.[ 1 ] ?? {} ) as Record< string, unknown >;
}

describe( 'tracks wrappers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsReaderChatHost.mockReturnValue( false );
		setResolvedAgentId( undefined );
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = { isDevMode: true };
	} );

	afterEach( () => {
		setResolvedAgentId( undefined );
		delete ( globalThis as { agentsManagerData?: unknown } ).agentsManagerData;
		delete ( window as Window ).bigSkyInitialState;
	} );

	describe( 'recordBigSkyTracksEvent', () => {
		it( 'falls back to honest defaults when bigSkyInitialState is absent', () => {
			recordBigSkyTracksEvent( 'chat_input_send_message', {
				message_length: 5,
			} );

			const [ eventName ] = mockRecordTracksEvent.mock.calls[ 0 ];
			expect( eventName ).toBe( 'jetpack_big_sky_chat_input_send_message' );

			const props = lastEventProps();
			expect( props ).toMatchObject( {
				message_length: 5,
				is_test: true,
				sessionid: 'session-xyz',
				session_type: 'unknown',
				phase: 'editor',
				big_sky_version: '0',
				screen: 'site-editor',
				post_type: '',
				is_home_page: false,
			} );
		} );

		it( 'sources session_type, screen, and big_sky_version from bigSkyInitialState', () => {
			( window as Window ).bigSkyInitialState = {
				bigSkyVersion: '7',
				isFreeTrial: '',
				currentScreen: { screen: 'dashboard' },
			};

			recordBigSkyTracksEvent( 'chat_input_send_message' );

			expect( lastEventProps() ).toMatchObject( {
				session_type: 'paid-user-session',
				screen: 'dashboard',
				big_sky_version: '7',
			} );
		} );

		it( 'lets caller props win on collision', () => {
			recordBigSkyTracksEvent( 'x', { sessionid: 'override' } );
			expect( lastEventProps().sessionid ).toBe( 'override' );
		} );

		it( 'no-ops when the resolved agent id is a reader-chat agent', () => {
			setResolvedAgentId( 'reader-chat' );
			recordBigSkyTracksEvent( 'chat_input_send_message' );
			expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'fires when the resolved agent id is a non-reader agent', () => {
			setResolvedAgentId( 'big-sky' );
			recordBigSkyTracksEvent( 'chat_input_send_message' );
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires when the resolved agent id is unset', () => {
			setResolvedAgentId( undefined );
			recordBigSkyTracksEvent( 'chat_input_send_message' );
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'recordAgentsManagerTracksEvent', () => {
		it( 'injects the unified base-prop set', () => {
			recordAgentsManagerTracksEvent( 'chat_minimize' );

			const [ eventName ] = mockRecordTracksEvent.mock.calls[ 0 ];
			expect( eventName ).toBe( 'calypso_agents_manager_chat_minimize' );

			const props = lastEventProps();
			expect( props ).toMatchObject( {
				ai_session_id: 'session-xyz',
				agent_name: 'dolly',
				surface: 'editor',
				is_test: true,
			} );
			// `is_a11n` is an unresolved seam — present but undefined for now.
			expect( props ).toHaveProperty( 'is_a11n', undefined );
		} );

		it( 'uses the reader-chat surface token off the editor', () => {
			mockIsReaderChatHost.mockReturnValue( true );
			recordAgentsManagerTracksEvent( 'x' );
			expect( lastEventProps().surface ).toBe( 'reader-chat' );
		} );

		it( 'fires even when the resolved agent id is a reader-chat agent', () => {
			setResolvedAgentId( 'reader-chat' );
			recordAgentsManagerTracksEvent( 'chat_minimize' );
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'is_test (getIsTest)', () => {
		it( 'is true when agentsManagerData asserts dev mode', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = { isDevMode: true };
			recordAgentsManagerTracksEvent( 'x' );
			expect( lastEventProps().is_test ).toBe( true );
		} );

		it( 'falls through to bigSkyInitialState when agentsManagerData omits isDevMode', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {};
			( window as Window ).bigSkyInitialState = { isDevMode: '1' };
			recordAgentsManagerTracksEvent( 'x' );
			expect( lastEventProps().is_test ).toBe( true );
		} );

		it( 'is false when neither source asserts dev mode', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {};
			recordAgentsManagerTracksEvent( 'x' );
			expect( lastEventProps().is_test ).toBe( false );
		} );
	} );

	describe( 'getBigSkyPageProps resilience', () => {
		it( 'does not throw and emits neutral page props when select throws', () => {
			mockSelect.mockImplementation( () => {
				throw new Error( 'store not registered' );
			} );

			expect( () => recordBigSkyTracksEvent( 'chat_input_send_message' ) ).not.toThrow();
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( lastEventProps() ).toMatchObject( { post_type: '', is_home_page: false } );

			mockSelect.mockImplementation( () => ( {} ) as ReturnType< typeof select > );
		} );
	} );
} );

describe( 'getBigSkyTracksData', () => {
	function setState( state: Window[ 'bigSkyInitialState' ] ): void {
		( window as Window ).bigSkyInitialState = state;
	}

	afterEach( () => {
		delete ( window as Window ).bigSkyInitialState;
	} );

	it( 'returns all fallbacks when the blob is absent', () => {
		expect( getBigSkyTracksData() ).toEqual( {
			bigSkyVersion: '0',
			sessionType: 'unknown',
			screen: 'site-editor',
			isDevMode: false,
		} );
	} );

	it( 'maps the present blob to resolved values', () => {
		setState( {
			bigSkyVersion: '7',
			isFreeTrial: '1',
			isDevMode: '1',
			currentScreen: { screen: 'dashboard' },
		} );

		expect( getBigSkyTracksData() ).toEqual( {
			bigSkyVersion: '7',
			sessionType: 'free-trial-session',
			screen: 'dashboard',
			isDevMode: true,
		} );
	} );

	it( 'reports a paid session when isFreeTrial is the empty string', () => {
		setState( { isFreeTrial: '' } );
		expect( getBigSkyTracksData().sessionType ).toBe( 'paid-user-session' );
	} );

	it( 'reports a paid session when isFreeTrial is missing from a present blob', () => {
		setState( { bigSkyVersion: '7' } );
		expect( getBigSkyTracksData().sessionType ).toBe( 'paid-user-session' );
	} );

	it( 'falls back to per-field defaults for a partial blob', () => {
		setState( { isFreeTrial: '1' } );
		expect( getBigSkyTracksData() ).toEqual( {
			bigSkyVersion: '0',
			sessionType: 'free-trial-session',
			screen: 'site-editor',
			isDevMode: false,
		} );
	} );
} );
