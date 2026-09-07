/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn( () => ( {} ) ) } ) );
jest.mock( '../agent-session', () => ( { getActiveSessionId: jest.fn( () => 'session-xyz' ) } ) );
jest.mock( '../is-reader-chat-agent', () => {
	const actual = jest.requireActual( '../is-reader-chat-agent' );
	return { ...actual, isReaderChatHost: jest.fn( () => false ) };
} );

import { select } from '@wordpress/data';
import { getActiveSessionId } from '../agent-session';
import { isReaderChatHost } from '../is-reader-chat-agent';
import { setLoadedProviderIds } from '../loaded-provider-ids';
import { setResolvedAgentId } from '../resolved-agent-id';
import {
	getBigSkyTracksData,
	recordAgentsManagerTracksEvent,
	recordBigSkyTracksEvent,
} from '../tracks';

const mockRecordTracksEvent = recordTracksEvent as jest.MockedFunction< typeof recordTracksEvent >;
const mockIsReaderChatHost = isReaderChatHost as jest.MockedFunction< typeof isReaderChatHost >;
const mockSelect = select as jest.MockedFunction< typeof select >;
const mockGetActiveSessionId = getActiveSessionId as jest.MockedFunction<
	typeof getActiveSessionId
>;

function lastEventProps(): Record< string, unknown > {
	const call = mockRecordTracksEvent.mock.calls.at( -1 );
	return ( call?.[ 1 ] ?? {} ) as Record< string, unknown >;
}

describe( 'tracks wrappers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		// clearAllMocks keeps implementations, so restore any per-test override.
		mockSelect.mockImplementation( () => ( {} ) as ReturnType< typeof select > );
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
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message', {
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

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			expect( lastEventProps() ).toMatchObject( {
				session_type: 'paid-user-session',
				screen: 'dashboard',
				big_sky_version: '7',
			} );
		} );

		it( 'lets caller props win on collision', () => {
			recordBigSkyTracksEvent( 'jetpack_big_sky_x', { sessionid: 'override' } );
			expect( lastEventProps().sessionid ).toBe( 'override' );
		} );

		it( 'no-ops when the resolved agent id is a reader-chat agent', () => {
			setResolvedAgentId( 'reader-chat' );
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );
			expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'fires when the resolved agent id is a non-reader agent', () => {
			setResolvedAgentId( 'big-sky' );
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires when the resolved agent id is unset', () => {
			setResolvedAgentId( undefined );
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'adds the canonical server-provided blog ID', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
				isDevMode: false,
				site: { ID: 12345 },
			};

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			expect( lastEventProps().blog_id ).toBe( 12345 );
		} );

		it( 'duplicates the session ID into the standard ai_session_id', () => {
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			expect( lastEventProps() ).toMatchObject( {
				sessionid: 'session-xyz',
				ai_session_id: 'session-xyz',
			} );
		} );

		it( 'omits ai_session_id while no session exists yet', () => {
			mockGetActiveSessionId.mockReturnValueOnce( '' );

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			const props = lastEventProps();
			expect( props.sessionid ).toBe( '' );
			expect( props ).not.toHaveProperty( 'ai_session_id' );
		} );

		it( 'mirrors a caller-overridden sessionid into ai_session_id', () => {
			recordBigSkyTracksEvent( 'jetpack_big_sky_x', { sessionid: 'override' } );

			expect( lastEventProps() ).toMatchObject( {
				sessionid: 'override',
				ai_session_id: 'override',
			} );
		} );

		it( 'omits ai_session_id when a caller overrides sessionid to empty', () => {
			recordBigSkyTracksEvent( 'jetpack_big_sky_x', { sessionid: '' } );

			expect( lastEventProps() ).not.toHaveProperty( 'ai_session_id' );
		} );

		it( 'lets a caller-supplied ai_session_id win over the mirror', () => {
			recordBigSkyTracksEvent( 'jetpack_big_sky_x', { ai_session_id: 'custom' } );

			expect( lastEventProps() ).toMatchObject( {
				sessionid: 'session-xyz',
				ai_session_id: 'custom',
			} );
		} );

		it( 'labels editor-hosted parity events with the block_editor surface', () => {
			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			expect( lastEventProps().surface ).toBe( 'block_editor' );
		} );

		it( 'omits surface when the editor store is not registered', () => {
			mockSelect.mockImplementation(
				( store ) =>
					( store === 'core/editor' ? undefined : {} ) as unknown as ReturnType< typeof select >
			);

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			expect( lastEventProps() ).not.toHaveProperty( 'surface' );
		} );

		it( 'omits blog_id when the server payload has no valid site ID', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
				isDevMode: false,
				site: { ID: 0 },
			};

			recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' );

			expect( lastEventProps() ).not.toHaveProperty( 'blog_id' );
		} );
	} );

	describe( 'recordAgentsManagerTracksEvent', () => {
		it( 'injects the unified base-prop set', () => {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );

			const [ eventName ] = mockRecordTracksEvent.mock.calls[ 0 ];
			expect( eventName ).toBe( 'calypso_agents_manager_chat_minimize' );

			const props = lastEventProps();
			expect( props ).toMatchObject( {
				ai_session_id: 'session-xyz',
				agent_name: 'dolly',
				agent_manager_version: 'none',
				provider_ids: 'none',
				surface: 'editor',
				is_test: true,
			} );
			expect( props ).not.toHaveProperty( 'is_a11n' );
		} );

		it( 'sends the resolved agent id as agent_name when one is set', () => {
			setResolvedAgentId( 'plugin-compass' );
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );
			expect( lastEventProps().agent_name ).toBe( 'plugin-compass' );
		} );

		it( 'falls back to the Dolly agent id while no agent is resolved', () => {
			setResolvedAgentId( undefined );
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );
			expect( lastEventProps().agent_name ).toBe( 'dolly' );
		} );

		it( 'uses the reader-chat surface token off the editor', () => {
			mockIsReaderChatHost.mockReturnValue( true );
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );
			expect( lastEventProps().surface ).toBe( 'reader-chat' );
		} );

		it( 'adds the canonical server-provided blog ID when available', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
				isDevMode: false,
				site: { ID: 12345 },
			};

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );

			expect( lastEventProps().blog_id ).toBe( 12345 );
		} );

		it( 'omits blog_id when the server payload has no valid site ID', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
				isDevMode: false,
				site: { ID: 0 },
			};

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );

			expect( lastEventProps() ).not.toHaveProperty( 'blog_id' );
		} );

		it( 'fires even when the resolved agent id is a reader-chat agent', () => {
			setResolvedAgentId( 'reader-chat' );
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'provider_ids', () => {
		afterEach( () => {
			setLoadedProviderIds( undefined );
		} );

		it( 'joins the loaded provider ids, sorted for stable grouping', () => {
			setLoadedProviderIds( [ 'woocommerce-ai', 'jetpack-ai' ] );

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );

			expect( lastEventProps().provider_ids ).toBe( 'jetpack-ai,woocommerce-ai' );
		} );

		it( 'sends none when the providers loaded with no external entries', () => {
			setLoadedProviderIds( [] );

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );

			expect( lastEventProps().provider_ids ).toBe( 'none' );
		} );

		it( 'sends none until the providers load', () => {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_minimize' );

			expect( lastEventProps().provider_ids ).toBe( 'none' );
		} );
	} );

	describe( 'agent_manager_version', () => {
		afterEach( () => {
			delete window.COMMIT_SHA;
		} );

		it( 'sends the Jetpack-injected build version when present', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
				isDevMode: true,
				version: 'gutenberg:abc123',
			};

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );

			expect( lastEventProps().agent_manager_version ).toBe( 'gutenberg:abc123' );
		} );

		it( 'falls back to the Calypso commit on Calypso-rendered pages', () => {
			window.COMMIT_SHA = 'deadbeef';

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );

			expect( lastEventProps().agent_manager_version ).toBe( 'calypso:deadbeef' );
		} );

		it( 'prefers the injected version over the Calypso commit', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
				isDevMode: true,
				version: 'wp-admin:abc123',
			};
			window.COMMIT_SHA = 'deadbeef';

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );

			expect( lastEventProps().agent_manager_version ).toBe( 'wp-admin:abc123' );
		} );

		it( "normalizes the dev server's '(unknown)' commit to calypso:dev", () => {
			window.COMMIT_SHA = '(unknown)';

			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );

			expect( lastEventProps().agent_manager_version ).toBe( 'calypso:dev' );
		} );

		it( 'sends none when neither source is available', () => {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );

			expect( lastEventProps().agent_manager_version ).toBe( 'none' );
		} );
	} );

	describe( 'entry-point events', () => {
		it( 'lets a caller-supplied surface override the base value', () => {
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_ai_chat_clicked', {
				surface: 'editor_toolbar',
				section: 'gutenberg',
				action: 'open',
			} );

			const [ eventName ] = mockRecordTracksEvent.mock.calls[ 0 ];
			expect( eventName ).toBe( 'calypso_agents_manager_ai_chat_clicked' );

			expect( lastEventProps() ).toMatchObject( {
				section: 'gutenberg',
				action: 'open',
				ai_session_id: 'session-xyz',
				agent_name: 'dolly',
				surface: 'editor_toolbar',
				is_test: true,
			} );
		} );
	} );

	describe( 'is_a11n', () => {
		const recorders = [
			[ 'Big Sky', () => recordBigSkyTracksEvent( 'jetpack_big_sky_x' ) ],
			[ 'Agents Manager', () => recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' ) ],
		] as const;

		it.each( recorders )(
			'%s recorder injects true when the server identifies Automattician traffic',
			( _name, recordEvent ) => {
				( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
					isDevMode: true,
					isA11n: true,
				};

				recordEvent();

				expect( lastEventProps().is_a11n ).toBe( true );
			}
		);

		it.each( recorders )(
			'%s recorder injects false when the server identifies non-Automattician traffic',
			( _name, recordEvent ) => {
				( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
					isDevMode: false,
					isA11n: false,
				};

				recordEvent();

				expect( lastEventProps().is_a11n ).toBe( false );
			}
		);

		it.each( recorders )(
			'%s recorder omits the property when the server payload has no identity signal',
			( _name, recordEvent ) => {
				( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
					isDevMode: false,
				};

				recordEvent();

				expect( lastEventProps() ).not.toHaveProperty( 'is_a11n' );
			}
		);
	} );

	describe( 'is_test (getIsTest)', () => {
		it( 'is true when agentsManagerData asserts dev mode', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = { isDevMode: true };
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );
			expect( lastEventProps().is_test ).toBe( true );
		} );

		it( 'falls through to bigSkyInitialState when agentsManagerData omits isDevMode', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {};
			( window as Window ).bigSkyInitialState = { isDevMode: '1' };
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );
			expect( lastEventProps().is_test ).toBe( true );
		} );

		it( 'is false when neither source asserts dev mode', () => {
			( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {};
			recordAgentsManagerTracksEvent( 'calypso_agents_manager_x' );
			expect( lastEventProps().is_test ).toBe( false );
		} );
	} );

	describe( 'getBigSkyPageProps resilience', () => {
		it( 'does not throw and emits neutral page props when select throws', () => {
			mockSelect.mockImplementation( () => {
				throw new Error( 'store not registered' );
			} );

			expect( () =>
				recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' )
			).not.toThrow();
			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( lastEventProps() ).toMatchObject( { post_type: '', is_home_page: false } );
			expect( lastEventProps() ).not.toHaveProperty( 'surface' );

			mockSelect.mockImplementation( () => ( {} ) as ReturnType< typeof select > );
		} );

		it( 'keeps surface when a later selector throws after the editor store resolved', () => {
			mockSelect.mockImplementation( ( store ) => {
				if ( store === 'core/editor' ) {
					return {} as ReturnType< typeof select >;
				}
				throw new Error( 'core-data selector failed' );
			} );

			expect( () =>
				recordBigSkyTracksEvent( 'jetpack_big_sky_chat_input_send_message' )
			).not.toThrow();
			expect( lastEventProps() ).toMatchObject( {
				surface: 'block_editor',
				post_type: '',
				is_home_page: false,
			} );

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
