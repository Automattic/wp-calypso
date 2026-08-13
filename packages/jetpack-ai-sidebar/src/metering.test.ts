/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { normalizeJetpackAiQuota, useChatNotice } from './metering';
import { trackJetpackAiUpgrade } from './utils/tracking';

jest.mock( './utils/tracking', () => ( {
	trackJetpackAiUpgrade: jest.fn(),
} ) );

const mockTrackJetpackAiUpgrade = jest.mocked( trackJetpackAiUpgrade );
const mockAssign = jest.fn();

function setAgentsManagerData( value: unknown ): void {
	Object.defineProperty( globalThis, 'agentsManagerData', {
		configurable: true,
		writable: true,
		value,
	} );
}

const serverQuota = {
	plan: 'free',
	upgrade: { kind: 'wpcom-plan', url: 'https://wordpress.com/checkout/example.com/personal' },
};

/**
 * The message the current WPCOM agent request returns for an exhausted quota,
 * wrapped the way Agenttic 0.1.87 surfaces a JSON-RPC error. The published
 * client exposes only `error.message`, so no machine-readable code reaches us.
 */
const CURRENT_ENDPOINT_ERROR =
	'Protocol request error: You have reached your Jetpack AI usage limit.';

beforeAll( () => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, assign: mockAssign },
	} );
} );

beforeEach( () => {
	Reflect.deleteProperty( globalThis, 'agentsManagerData' );
	mockTrackJetpackAiUpgrade.mockReset();
	mockAssign.mockReset();
} );

describe( 'normalizeJetpackAiQuota', () => {
	it( 'reads the server-owned plan and upgrade destination', () => {
		expect( normalizeJetpackAiQuota( serverQuota ) ).toEqual( {
			plan: 'free',
			exhausted: false,
			upgradeUrl: 'https://wordpress.com/checkout/example.com/personal',
		} );
	} );

	it( 'reads the server-owned initial exhausted state', () => {
		expect( normalizeJetpackAiQuota( { ...serverQuota, exhausted: true } ) ).toMatchObject( {
			exhausted: true,
		} );
	} );

	it.each( [ 'true', 1, undefined ] )(
		'treats a non-boolean exhausted flag as false: %p',
		( value ) => {
			expect( normalizeJetpackAiQuota( { ...serverQuota, exhausted: value } ) ).toMatchObject( {
				exhausted: false,
			} );
		}
	);

	it.each( [
		[ 'a look-alike subdomain', 'https://wordpress.com.evil.example/checkout' ],
		[ 'a trusted-host subdomain', 'https://cdn.wordpress.com/checkout' ],
		[ 'an insecure scheme', 'http://wordpress.com/checkout' ],
		[ 'a relative path', '/checkout/example.com/personal' ],
		[ 'a javascript URL', 'javascript:alert(1)' ],
	] )( 'drops the upgrade action for %s', ( _label, url ) => {
		expect( normalizeJetpackAiQuota( { ...serverQuota, upgrade: { url } } ) ).toEqual( {
			plan: 'free',
			exhausted: false,
			upgradeUrl: null,
		} );
	} );

	it.each( [ undefined, null, 'free', {}, { plan: 'enterprise' } ] )(
		'discards the snapshot without a recognized plan: %p',
		( value ) => {
			expect( normalizeJetpackAiQuota( value ) ).toBeUndefined();
		}
	);
} );

describe( 'useChatNotice', () => {
	it( 'stays silent until the backend rejects a turn', () => {
		setAgentsManagerData( { jetpackAiQuota: serverQuota } );

		const { result } = renderHook( () => useChatNotice( { error: null } ) );

		expect( result.current ).toBeUndefined();
	} );

	it( 'recognizes the message the current WPCOM endpoint returns', () => {
		setAgentsManagerData( { jetpackAiQuota: serverQuota } );

		const { result } = renderHook( () => useChatNotice( { error: CURRENT_ENDPOINT_ERROR } ) );

		expect( result.current ).toMatchObject( {
			message: 'You’re out of free credits.',
			status: 'error',
			dismissible: false,
			suppressCurrentError: true,
		} );
	} );

	it( 'does not latch on an unrelated error that quotes the quota message', () => {
		setAgentsManagerData( { jetpackAiQuota: serverQuota } );

		const { result } = renderHook( () =>
			useChatNotice( {
				error: 'Unexpected response while discussing the Jetpack AI usage limit.',
			} )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'does not latch on an unrelated error that embeds the quota code', () => {
		setAgentsManagerData( { jetpackAiQuota: serverQuota } );

		const { result } = renderHook( () =>
			useChatNotice( {
				error: 'Unexpected JSON payload contained jetpack_ai_quota_exhausted metadata.',
			} )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'renders a persistent Upgrade notice once the backend reports exhaustion', () => {
		setAgentsManagerData( { jetpackAiQuota: serverQuota } );

		const { result } = renderHook( () => useChatNotice( { error: 'jetpack_ai_quota_exhausted' } ) );

		expect( result.current ).toMatchObject( {
			message: 'You’re out of free credits.',
			status: 'error',
			dismissible: false,
		} );

		result.current?.action?.onClick();

		expect( mockTrackJetpackAiUpgrade ).toHaveBeenCalledWith();
		expect( mockAssign ).toHaveBeenCalledWith(
			'https://wordpress.com/checkout/example.com/personal'
		);
	} );

	it( 'keeps the notice up after Agenttic clears the error for the next send', () => {
		setAgentsManagerData( { jetpackAiQuota: serverQuota } );

		const { result, rerender } = renderHook(
			( { error }: { error: string | null } ) => useChatNotice( { error } ),
			{ initialProps: { error: CURRENT_ENDPOINT_ERROR as string | null } }
		);

		expect( result.current ).toBeDefined();

		rerender( { error: null } );

		expect( result.current ).toMatchObject( {
			message: 'You’re out of free credits.',
			suppressCurrentError: false,
		} );
	} );

	it( 'shows the notice on load when the server snapshot is already exhausted', () => {
		setAgentsManagerData( { jetpackAiQuota: { ...serverQuota, exhausted: true } } );

		const { result } = renderHook( () => useChatNotice( { error: null } ) );

		expect( result.current ).toMatchObject( { message: 'You’re out of free credits.' } );
	} );

	it( 'uses the paid copy and omits the action without a trusted upgrade URL', () => {
		setAgentsManagerData( { jetpackAiQuota: { plan: 'paid', upgrade: null } } );

		const { result } = renderHook( () => useChatNotice( { error: 'jetpack_ai_quota_exhausted' } ) );

		expect( result.current ).toMatchObject( { message: 'No AI requests remaining' } );
		expect( result.current?.action ).toBeUndefined();
	} );

	it( 'still notices exhaustion when the server injected no quota snapshot', () => {
		const { result } = renderHook( () => useChatNotice( { error: 'jetpack_ai_quota_exhausted' } ) );

		expect( result.current ).toMatchObject( {
			message: 'No AI requests remaining',
			dismissible: false,
		} );
	} );

	describe( 'upgrade URL carried by the rejection message', () => {
		it( 'accepts a trusted URL when there is no inline snapshot', () => {
			const { result } = renderHook( () =>
				useChatNotice( {
					error:
						'Protocol request error: You have reached your Jetpack AI usage limit. Upgrade at https://wordpress.com/checkout/example.com/ai-monthly.',
				} )
			);

			result.current?.action?.onClick();

			expect( mockAssign ).toHaveBeenCalledWith(
				'https://wordpress.com/checkout/example.com/ai-monthly'
			);
		} );

		it( 'prefers the rejection URL over the page-load snapshot', () => {
			setAgentsManagerData( { jetpackAiQuota: serverQuota } );

			const { result } = renderHook( () =>
				useChatNotice( {
					error:
						'Protocol request error: You have reached your Jetpack AI usage limit. See https://jetpack.com/upgrade/ai',
				} )
			);

			result.current?.action?.onClick();

			expect( mockAssign ).toHaveBeenCalledWith( 'https://jetpack.com/upgrade/ai' );
		} );

		it.each( [
			[ 'a look-alike host', 'https://wordpress.com.evil.example/checkout' ],
			[ 'a trusted-host subdomain', 'https://cdn.wordpress.com/checkout' ],
			[ 'an insecure scheme', 'http://wordpress.com/checkout' ],
		] )( 'falls back to the snapshot for %s', ( _label, url ) => {
			setAgentsManagerData( { jetpackAiQuota: serverQuota } );

			const { result } = renderHook( () =>
				useChatNotice( { error: `Jetpack AI usage limit reached. Upgrade at ${ url }` } )
			);

			result.current?.action?.onClick();

			expect( mockAssign ).toHaveBeenCalledWith(
				'https://wordpress.com/checkout/example.com/personal'
			);
		} );

		it( 'skips an untrusted URL and takes a later trusted one', () => {
			const { result } = renderHook( () =>
				useChatNotice( {
					error:
						'Jetpack AI usage limit reached (https://public-api.wordpress.com/rest/v1). Upgrade at https://wordpress.com/checkout/example.com/personal',
				} )
			);

			result.current?.action?.onClick();

			expect( mockAssign ).toHaveBeenCalledWith(
				'https://wordpress.com/checkout/example.com/personal'
			);
		} );

		it( 'offers no action when neither the rejection nor a snapshot has a trusted URL', () => {
			const { result } = renderHook( () =>
				useChatNotice( {
					error: 'Jetpack AI usage limit reached. Upgrade at https://evil.example/checkout',
				} )
			);

			expect( result.current ).toMatchObject( { message: 'No AI requests remaining' } );
			expect( result.current?.action ).toBeUndefined();
			expect( mockAssign ).not.toHaveBeenCalled();
		} );
	} );
} );
