/**
 * Tests for Image Studio tracking functions
 */
import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import { ImageStudioEntryPoint } from '../store';
import { ImageStudioMode } from '../types';
import { contextProvider } from './client-context';
import {
	getImageStudioRequestErrorType,
	trackImageStudioClosed,
	trackImageStudioOpened,
	trackImageStudioCreditsMeterOpened,
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
} from './tracking';

// Mock session
vi.mock( '../utils/session', () => ( {
	getSessionId: vi.fn( () => 'test-session-id' ),
} ) );

// The package root loads the whole chat; the credits helpers are all this file uses.
vi.mock( '@automattic/agents-manager', () =>
	vi.importActual( '@automattic/agents-manager/src/utils/credits' )
);

vi.mock( './client-context', () => ( { contextProvider: { getClientContext: vi.fn() } } ) );

const recordTracksEventMock = recordTracksEventBase as Mock;
const selectMock = select as Mock;
const getClientContextMock = vi.mocked( contextProvider.getClientContext );
/** The client context Image Studio's agent receives while its modal is open. */
const IMAGE_STUDIO_CONTEXT = {
	url: 'https://example.com/wp-admin/post.php',
	pathname: '/wp-admin/post.php',
	search: '',
	environment: 'image-studio',
} as const;

describe( 'getImageStudioRequestErrorType', () => {
	it( 'identifies the streamed free-credit exhaustion error as quota exceeded', () => {
		const error = new Error(
			'Streaming error: Congratulations on exploring Image Studio and reaching the free requests limit! Upgrade now to keep using it. https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge'
		);

		expect( getImageStudioRequestErrorType( error, ImageStudioMode.Generate ) ).toBe(
			'quota_exceeded'
		);
	} );

	it.each( [
		[ ImageStudioMode.Generate, 'generation_failed' ],
		[ ImageStudioMode.Edit, 'edit_failed' ],
	] as const )( 'preserves the generic %s failure type for other errors', ( mode, errorType ) => {
		expect( getImageStudioRequestErrorType( new Error( 'Provider failed' ), mode ) ).toBe(
			errorType
		);
	} );
} );

describe( 'trackImageStudioOpened', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		// Set up window properties for screen/post_type
		( window as any ).pagenow = 'post';
		( window as any ).typenow = 'page';
	} );

	afterEach( () => {
		delete ( window as any ).pagenow;
		delete ( window as any ).typenow;
	} );

	it( 'should include sessionid in the opened event', () => {
		trackImageStudioOpened( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( { sessionid: 'test-session-id' } )
		);
	} );

	it( 'should include screen and post_type from window globals', () => {
		trackImageStudioOpened( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( {
				screen: 'post',
				post_type: 'page',
			} )
		);
	} );

	it( 'should use the passed entryPoint as placement when store has no value', () => {
		// At open time the store has not been updated yet, so it returns null
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );

		trackImageStudioOpened( {
			mode: 'generate',
			entryPoint: ImageStudioEntryPoint.EditorBlock,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( { placement: 'editor_block' } )
		);
	} );

	it( 'should include mode and attachment_id', () => {
		trackImageStudioOpened( {
			mode: 'edit',
			attachmentId: 42,
			entryPoint: ImageStudioEntryPoint.MediaLibrary,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_opened',
			expect.objectContaining( {
				mode: 'edit',
				attachment_id: 42,
			} )
		);
	} );
} );

describe( 'recordImageStudioEvent — tracking context properties', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		delete ( window as any ).imageStudioData;
	} );

	afterEach( () => {
		delete ( window as any ).imageStudioData;
	} );

	it( 'should include blog_id, site_type, and is_a11n from imageStudioData', () => {
		( window as any ).imageStudioData = {
			blogId: 1234,
			siteType: 'atomic',
			isA11n: true,
		};

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				blog_id: 1234,
				site_type: 'atomic',
				is_a11n: true,
			} )
		);
	} );

	it( 'should parse blogId when it is provided as a string', () => {
		( window as any ).imageStudioData = {
			blogId: '5678',
			siteType: 'simple',
		};

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				blog_id: 5678,
				site_type: 'simple',
			} )
		);
	} );

	it( 'should normalize legacy wpcom and woa site type values', () => {
		( window as any ).imageStudioData = { siteType: 'woa' };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { site_type: 'atomic' } )
		);

		vi.clearAllMocks();
		( window as any ).imageStudioData = { siteType: 'wpcom' };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { site_type: 'simple' } )
		);
	} );

	it( 'should default site_type to jetpack and is_a11n to false', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				site_type: 'jetpack',
				is_a11n: false,
			} )
		);
	} );

	it( 'should omit blog_id when blogId is unavailable or invalid', () => {
		( window as any ).imageStudioData = {
			blogId: 'not-a-number',
			siteType: 'jetpack',
		};

		trackImageStudioClosed( { mode: 'edit' } );

		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_closed' );
		expect( call[ 1 ] ).not.toHaveProperty( 'blog_id' );
		expect( call[ 1 ] ).toMatchObject( { site_type: 'jetpack' } );
	} );
} );

describe( 'recordImageStudioEvent — is_test property', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		delete ( window as any ).imageStudioData;
		delete ( window as any ).pagenow;
		delete ( window as any ).typenow;
	} );

	afterEach( () => {
		delete ( window as any ).imageStudioData;
	} );

	it( 'should include is_test when imageStudioData.isDevMode is true', () => {
		( window as any ).imageStudioData = { enabled: true, isDevMode: true };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: true } )
		);
	} );

	it( 'should include is_test as false when imageStudioData.isDevMode is false', () => {
		( window as any ).imageStudioData = { enabled: true, isDevMode: false };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: false } )
		);
	} );

	it( 'should default is_test to false when imageStudioData is absent', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: false } )
		);
	} );

	it( 'should default is_test to false when isDevMode is not set', () => {
		( window as any ).imageStudioData = { enabled: true };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { is_test: false } )
		);
	} );
} );

describe( 'recordImageStudioEvent — unified AI property standards', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		delete ( window as any ).imageStudioData;
	} );

	afterEach( () => {
		delete ( window as any ).imageStudioData;
	} );

	it( 'should identify the product with agent_name', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { agent_name: 'image_studio' } )
		);
	} );

	it( 'should send the session under both ai_session_id and sessionid', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( {
				ai_session_id: 'test-session-id',
				sessionid: 'test-session-id',
			} )
		);
	} );

	it( 'should include agent_version from imageStudioData', () => {
		( window as any ).imageStudioData = { version: '15.9' };

		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { agent_version: '15.9' } )
		);
	} );

	it( 'should send agent_version as none rather than omitting it when unavailable', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_closed',
			expect.objectContaining( { agent_version: 'none' } )
		);
	} );

	it( 'should let a caller-supplied property win over the defaults', () => {
		trackImageStudioClosed( { mode: 'edit' } );

		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 1 ] ).toMatchObject( { mode: 'edit' } );
	} );
} );

describe( 'upgrade notice tracking', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		getClientContextMock.mockReturnValue( IMAGE_STUDIO_CONTEXT );
	} );

	const siteCredits = {
		meter: 'site_credits',
		state: 'low',
		planTier: 'premium',
		creditsLeft: 8500,
		topUpCreditsLeft: 'none',
		ctaType: 'upgrade',
		ref: 'wp_ai_credits',
	} as const;

	const jetpackAiQuota = {
		meter: 'jetpack_ai',
		state: 'zero',
		planTier: 'none',
		creditsLeft: 'none',
		topUpCreditsLeft: 'none',
		ctaType: 'upgrade',
		ref: 'none',
	} as const;

	it( 'records the trigger and credit details with the shown event, to join the Agent’s credits events', () => {
		trackImageStudioUpgradeNoticeShown( {
			mode: ImageStudioMode.Generate,
			trigger: 'open',
			...siteCredits,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_upgrade_notice_shown',
			expect.objectContaining( {
				mode: 'generate',
				trigger: 'open',
				meter: 'site_credits',
				state: 'low',
				plan_tier: 'premium',
				credits_left: 8500,
				cta_type: 'upgrade',
				ref: 'wp_ai_credits',
			} )
		);
	} );

	it( 'records the Jetpack AI quota click and keeps the product-wide upgrade button event', () => {
		trackImageStudioUpgradeNoticeClick( {
			mode: ImageStudioMode.Edit,
			trigger: 'error',
			...jetpackAiQuota,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_upgrade_notice_click',
			expect.objectContaining( {
				mode: 'edit',
				trigger: 'error',
				meter: 'jetpack_ai',
				state: 'zero',
				plan_tier: 'none',
				credits_left: 'none',
				top_up_credits_left: 'none',
				agent_environment: 'image-studio',
				cta_type: 'upgrade',
				ref: 'none',
			} )
		);
		expect( recordTracksEventMock ).toHaveBeenCalledWith( 'jetpack_ai_upgrade_button', {
			placement: 'image-studio-limit-notice',
		} );
	} );

	it( 'records a popover click with the popover as its trigger', () => {
		trackImageStudioUpgradeNoticeClick( {
			mode: ImageStudioMode.Generate,
			trigger: 'popover',
			...siteCredits,
			state: 'ok',
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_upgrade_notice_click',
			expect.objectContaining( { trigger: 'popover', state: 'ok' } )
		);
	} );

	it( 'keeps site credits upgrades out of the Jetpack AI upgrade button funnel', () => {
		trackImageStudioUpgradeNoticeClick( {
			mode: ImageStudioMode.Edit,
			trigger: 'refresh',
			...siteCredits,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_upgrade_notice_click',
			expect.objectContaining( { meter: 'site_credits', ref: 'wp_ai_credits' } )
		);
		expect( recordTracksEventMock ).not.toHaveBeenCalledWith(
			'jetpack_ai_upgrade_button',
			expect.anything()
		);
	} );
} );

describe( 'credits popover tracking', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		getClientContextMock.mockReturnValue( IMAGE_STUDIO_CONTEXT );
	} );

	it( 'records what opened the popover, with the balance details', () => {
		trackImageStudioCreditsMeterOpened( {
			mode: ImageStudioMode.Edit,
			trigger: 'submit_blocked',
			meter: 'site_credits',
			state: 'zero',
			planTier: 'business',
			creditsLeft: 0,
			topUpCreditsLeft: 0,
		} );

		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_credits_meter_opened',
			expect.objectContaining( {
				mode: 'edit',
				trigger: 'submit_blocked',
				meter: 'site_credits',
				state: 'zero',
				plan_tier: 'business',
				credits_left: 0,
				top_up_credits_left: 0,
				agent_environment: 'image-studio',
			} )
		);
	} );
} );

describe( 'credits event details', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: vi.fn( () => null ),
		} );
		getClientContextMock.mockReturnValue( IMAGE_STUDIO_CONTEXT );
	} );

	const balance = {
		meter: 'site_credits',
		state: 'low',
		planTier: 'business',
		creditsLeft: 4000,
	} as const;
	const addCredits = { ctaType: 'top_up', ref: 'wp_ai_credits' } as const;

	/** Records each of the three credits events with the given top-ups balance. */
	const recordCreditsEvents = ( topUpCreditsLeft: number | 'none' ) => {
		const details = { ...balance, topUpCreditsLeft };
		trackImageStudioUpgradeNoticeShown( {
			mode: ImageStudioMode.Generate,
			trigger: 'open',
			...details,
			...addCredits,
		} );
		trackImageStudioUpgradeNoticeClick( {
			mode: ImageStudioMode.Generate,
			trigger: 'popover',
			...details,
			...addCredits,
		} );
		trackImageStudioCreditsMeterOpened( {
			mode: ImageStudioMode.Generate,
			trigger: 'click',
			...details,
		} );
	};
	const sent = ( property: string ) =>
		recordTracksEventMock.mock.calls.map( ( [ name, properties ] ) => [
			name,
			properties[ property ],
		] );

	it.each( [ 3000, 0, 'none' ] as const )(
		'sends the top-ups balance %o on each credits event',
		( topUpCreditsLeft ) => {
			recordCreditsEvents( topUpCreditsLeft );

			expect( sent( 'top_up_credits_left' ) ).toEqual( [
				[ 'jetpack_big_sky_image_studio_upgrade_notice_shown', topUpCreditsLeft ],
				[ 'jetpack_big_sky_image_studio_upgrade_notice_click', topUpCreditsLeft ],
				[ 'jetpack_big_sky_image_studio_credits_meter_opened', topUpCreditsLeft ],
			] );
		}
	);

	it( 'sends the client context’s environment unchanged on each credits event', () => {
		getClientContextMock.mockReturnValue( {
			...IMAGE_STUDIO_CONTEXT,
			environment: 'wp-admin',
		} );
		recordCreditsEvents( 'none' );

		expect( sent( 'agent_environment' ) ).toEqual( [
			[ 'jetpack_big_sky_image_studio_upgrade_notice_shown', 'wp-admin' ],
			[ 'jetpack_big_sky_image_studio_upgrade_notice_click', 'wp-admin' ],
			[ 'jetpack_big_sky_image_studio_credits_meter_opened', 'wp-admin' ],
		] );
	} );

	it.each( [
		[
			'has no environment',
			() =>
				( { ...IMAGE_STUDIO_CONTEXT, environment: undefined } ) as unknown as ReturnType<
					typeof contextProvider.getClientContext
				>,
		],
		[
			'throws',
			() => {
				throw new Error( 'The block editor store is missing' );
			},
		],
	] )( 'sends agent_environment as none when the client context %s', ( _case, context ) => {
		getClientContextMock.mockImplementation( context );
		recordCreditsEvents( 'none' );

		expect( sent( 'agent_environment' ) ).toEqual( [
			[ 'jetpack_big_sky_image_studio_upgrade_notice_shown', 'none' ],
			[ 'jetpack_big_sky_image_studio_upgrade_notice_click', 'none' ],
			[ 'jetpack_big_sky_image_studio_credits_meter_opened', 'none' ],
		] );
	} );
} );
