/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { getTrustedUpgradeUrl, useChatNotice } from './quota-notice';
import { trackJetpackAiUpgrade } from './utils/tracking';

jest.mock( './utils/tracking', () => ( {
	trackJetpackAiUpgrade: jest.fn(),
} ) );

const mockTrackJetpackAiUpgrade = jest.mocked( trackJetpackAiUpgrade );
const CURRENT_ENDPOINT_ERROR =
	'Protocol request error: You have reached your Jetpack AI usage limit.';
const mockOpen = jest.fn();

beforeAll( () => {
	Object.defineProperty( window, 'open', {
		configurable: true,
		value: mockOpen,
	} );
} );

beforeEach( () => {
	mockTrackJetpackAiUpgrade.mockReset();
	mockOpen.mockReset();
} );

describe( 'getTrustedUpgradeUrl', () => {
	it.each( [
		'http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
		'http://localhost/wordpress/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
	] )( 'allows the exact same-origin My Jetpack upgrade URL: %s', ( upgradeUrl ) => {
		expect( getTrustedUpgradeUrl( upgradeUrl ) ).toBe( upgradeUrl );
	} );

	it.each( [
		'http://example.com/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
		'http://localhost/wp-admin/admin.php?page=other#/add-jetpack-ai',
		'http://localhost/wp-admin/admin.php?page=my-jetpack#/other',
		'http://localhost/wp-admin/options-general.php?page=my-jetpack#/add-jetpack-ai',
		'http://localhost/wp-admin/admin.php?page=my-jetpack&other=value#/add-jetpack-ai',
	] )( 'rejects other same-origin or My Jetpack-shaped URLs: %s', ( upgradeUrl ) => {
		expect( getTrustedUpgradeUrl( upgradeUrl ) ).toBeNull();
	} );
} );

describe( 'useChatNotice', () => {
	it( 'stays silent until the backend rejects a request', () => {
		const { result } = renderHook( () => useChatNotice( { error: null } ) );

		expect( result.current ).toBeUndefined();
	} );

	it.each( [
		CURRENT_ENDPOINT_ERROR,
		'Protocol request error: ai_credit_allowance_exhausted.',
		'You have used all AI credits included with this site for this month.',
	] )( 'recognizes a backend rejection: %s', ( error ) => {
		const { result } = renderHook( () => useChatNotice( { error } ) );

		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			status: 'error',
			dismissible: false,
			suppressCurrentError: true,
		} );
	} );

	it.each( [
		'Unexpected response while discussing the Jetpack AI usage limit.',
		'Unexpected JSON payload contained jetpack_ai_quota_exhausted metadata.',
	] )( 'ignores an unrelated error: %s', ( error ) => {
		const { result } = renderHook( () => useChatNotice( { error } ) );

		expect( result.current ).toBeUndefined();
	} );

	it( 'keeps the notice after Agenttic clears the error', () => {
		const { result, rerender } = renderHook(
			( { error }: { error: string | null } ) => useChatNotice( { error } ),
			{ initialProps: { error: CURRENT_ENDPOINT_ERROR as string | null } }
		);

		rerender( { error: null } );

		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: false,
		} );
	} );

	it( 'suppresses a stale rejection after recovery and latches a later rejection', () => {
		const { result, rerender } = renderHook(
			( { error, recoveryRevision }: { error: string | null; recoveryRevision: number } ) =>
				useChatNotice( { error, recoveryRevision, scopeKey: 'site-123' } ),
			{
				initialProps: {
					error: CURRENT_ENDPOINT_ERROR as string | null,
					recoveryRevision: 0,
				},
			}
		);

		rerender( { error: CURRENT_ENDPOINT_ERROR, recoveryRevision: 1 } );
		expect( result.current ).toEqual( { suppressCurrentError: true } );

		rerender( { error: null, recoveryRevision: 1 } );
		expect( result.current ).toBeUndefined();

		rerender( { error: CURRENT_ENDPOINT_ERROR, recoveryRevision: 1 } );

		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: true,
		} );
	} );

	it( 'uses the same-origin My Jetpack upgrade URL', () => {
		const upgradeUrl = 'http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai';
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ CURRENT_ENDPOINT_ERROR } Upgrade at ${ upgradeUrl }`,
			} )
		);

		result.current?.action?.onClick();

		expect( mockTrackJetpackAiUpgrade ).toHaveBeenCalledWith();
		expect( mockOpen ).toHaveBeenCalledWith( upgradeUrl, '_blank', 'noopener,noreferrer' );
	} );

	it.each( [
		'https://wordpress.com/checkout/example.com/ai-monthly',
		'https://jetpack.com/upgrade/ai',
		'https://wordpress.com.evil.example/checkout',
		'https://cdn.wordpress.com/checkout',
		'https://evil.example/checkout',
		'http://wordpress.com/checkout',
		'https://wordpress.com:444/checkout',
		'https://user:password@wordpress.com/checkout',
	] )( 'does not offer an action for an untrusted URL: %s', ( upgradeUrl ) => {
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ CURRENT_ENDPOINT_ERROR } Upgrade at ${ upgradeUrl }`,
			} )
		);

		expect( result.current?.action ).toBeUndefined();
	} );

	it( 'skips an untrusted URL and uses a later trusted URL', () => {
		const trustedUrl = 'http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai';
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ CURRENT_ENDPOINT_ERROR } Ignore https://evil.example/checkout. Upgrade at ${ trustedUrl }`,
			} )
		);

		result.current?.action?.onClick();

		expect( mockOpen ).toHaveBeenCalledWith( trustedUrl, '_blank', 'noopener,noreferrer' );
	} );
} );
