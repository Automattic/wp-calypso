/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { trackSplitScreenGuideClick, trackSplitScreenGuideRendered } from './tracking';

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;
const mockedSelect = select as jest.MockedFunction< typeof select >;

const expectPrivacySafePayload = (
	properties: Record< string, unknown >,
	{ allowPostType = false }: { allowPostType?: boolean } = {}
) => {
	expect( properties ).not.toHaveProperty( 'post_id' );
	if ( ! allowPostType ) {
		expect( properties ).not.toHaveProperty( 'post_type' );
	}
	expect( properties ).not.toHaveProperty( 'block_index' );
	expect( properties ).not.toHaveProperty( 'run_id' );
	expect( properties ).not.toHaveProperty( 'client_run_id' );
	expect( properties ).not.toHaveProperty( 'trigger' );
	expect( properties ).not.toHaveProperty( 'cache_hit' );
	expect( properties ).not.toHaveProperty( 'auto_suggested_edit_count' );
	expect( properties ).not.toHaveProperty( 'manual_suggested_edit_count' );
	expect( properties ).not.toHaveProperty( 'success_count' );
	expect( properties ).not.toHaveProperty( 'failure_count' );
	expect( properties ).not.toHaveProperty( 'text' );
	expect( properties ).not.toHaveProperty( 'prompt' );
	expect( properties ).not.toHaveProperty( 'label' );
	expect( properties ).not.toHaveProperty( 'client_id' );
	expect( properties ).not.toHaveProperty( 'clientId' );
	expect( properties ).not.toHaveProperty( 'content' );
	expect( properties ).not.toHaveProperty( 'reviewer' );
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		getSessionId?: () => string;
	};
};

describe( 'Jetpack AI sidebar tracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			isDevMode: false,
			isA11n: false,
		};
		window.bigSkyInitialState = {
			isFreeTrial: '',
			currentScreen: { screen: 'post' },
		};
		mockedSelect.mockReturnValue( {
			getCurrentPostType: jest.fn( () => 'post' ),
		} as ReturnType< typeof select > );
		( window as WindowWithAgentsManagerActions ).__agentsManagerActions = {
			getSessionId: jest.fn( () => 'test-session-id' ),
		};
	} );

	afterEach( () => {
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
		delete window.bigSkyInitialState;
		delete ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	} );

	it( 'tracks split-screen guide clicks with stable component metadata', () => {
		trackSplitScreenGuideClick( { componentType: 'post-feedback' } );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith( 'jetpack_ai_split_screen_guide_click', {
			component_type: 'post-feedback',
			guide_variant: 'inline_action_card',
			is_test: false,
			is_a11n: false,
			post_type: 'post',
			screen: 'post',
			sessionid: 'test-session-id',
			session_type: 'paid-user-session',
		} );
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ], {
			allowPostType: true,
		} );
	} );

	it( 'tracks a split-screen guide impression with stable component metadata', () => {
		trackSplitScreenGuideRendered( { componentType: 'ai-editorial-review' } );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_split_screen_guide_rendered',
			{
				component_type: 'ai-editorial-review',
				guide_variant: 'inline_action_card',
				is_test: false,
				is_a11n: false,
				post_type: 'post',
				screen: 'post',
				sessionid: 'test-session-id',
				session_type: 'paid-user-session',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ], {
			allowPostType: true,
		} );
	} );

	it( 'uses the server-provided Automattician tracking value', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			isDevMode: false,
			isA11n: true,
		};

		trackSplitScreenGuideClick( { componentType: 'proofread' } );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_split_screen_guide_click',
			expect.objectContaining( { is_a11n: true } )
		);
	} );

	it( 'omits is_a11n when the server payload predates the signal', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = { isDevMode: false };

		trackSplitScreenGuideClick( { componentType: 'proofread' } );

		expect( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] ).not.toHaveProperty( 'is_a11n' );
	} );

	it( 'uses Agents Manager test and Big Sky free-trial and screen context', () => {
		( globalThis as Record< string, unknown > ).agentsManagerData = { isDevMode: true };
		window.bigSkyInitialState = {
			isFreeTrial: '1',
			currentScreen: { screen: 'site-editor' },
		};

		trackSplitScreenGuideClick( { componentType: 'proofread' } );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_split_screen_guide_click',
			expect.objectContaining( {
				is_test: true,
				session_type: 'free-trial-session',
				screen: 'site-editor',
			} )
		);
	} );

	it( 'does not use Big Sky dev mode as test context', () => {
		( window as unknown as { bigSkyInitialState: { isDevMode: string } } ).bigSkyInitialState = {
			isDevMode: '1',
		};

		trackSplitScreenGuideClick( { componentType: 'proofread' } );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_split_screen_guide_click',
			expect.objectContaining( { is_test: false } )
		);
	} );

	it( 'uses an empty post type when the editor store is unavailable', () => {
		mockedSelect.mockImplementation( () => {
			throw new Error( 'Store unavailable' );
		} );

		trackSplitScreenGuideClick( { componentType: 'proofread' } );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_split_screen_guide_click',
			expect.objectContaining( { post_type: '' } )
		);
	} );
} );
