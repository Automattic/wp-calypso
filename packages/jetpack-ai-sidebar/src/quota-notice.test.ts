/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { getTrustedUpgradeUrl, openJetpackAiUpgrade, useChatNotice } from './quota-notice';

const QUOTA_ERROR = 'Protocol request error: You have reached your Jetpack AI usage limit.';
const UPGRADE_URL = 'http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai';
const mockOpen = jest.fn();

beforeAll( () => {
	Object.defineProperty( window, 'open', {
		configurable: true,
		value: mockOpen,
	} );
} );

beforeEach( () => {
	mockOpen.mockReset();
} );

describe( 'getTrustedUpgradeUrl', () => {
	it.each( [
		UPGRADE_URL,
		'http://localhost/wordpress/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
	] )( 'accepts the exact same-origin My Jetpack route: %s', ( upgradeUrl ) => {
		expect( getTrustedUpgradeUrl( upgradeUrl ) ).toBe( upgradeUrl );
	} );

	it.each( [
		'https://evil.example/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
		'blob:http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
		'http://user:password@localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
		'http://localhost/wp-admin/options-general.php?page=my-jetpack#/add-jetpack-ai',
		'http://localhost/wp-admin/admin.php?page=other#/add-jetpack-ai',
		'http://localhost/wp-admin/admin.php?page=my-jetpack&other=value#/add-jetpack-ai',
		'http://localhost/wp-admin/admin.php?page=my-jetpack#/other',
	] )( 'rejects an untrusted or inexact route: %s', ( upgradeUrl ) => {
		expect( getTrustedUpgradeUrl( upgradeUrl ) ).toBeNull();
	} );

	it( 'strips only trailing prose punctuation from a trusted backend URL', () => {
		expect( getTrustedUpgradeUrl( `${ UPGRADE_URL }.` ) ).toBe( UPGRADE_URL );
	} );
} );

describe( 'openJetpackAiUpgrade', () => {
	it( 'records the click before opening a protected new tab', () => {
		const recordUpgradeClick = jest.fn();

		openJetpackAiUpgrade( UPGRADE_URL, recordUpgradeClick );

		expect( recordUpgradeClick ).toHaveBeenCalledTimes( 1 );
		expect( recordUpgradeClick.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			mockOpen.mock.invocationCallOrder[ 0 ]
		);
		expect( mockOpen ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
	} );

	it( 'still opens checkout when the injected tracker throws', () => {
		const recordUpgradeClick = jest.fn( () => {
			throw new Error( 'Tracking unavailable' );
		} );

		expect( () => openJetpackAiUpgrade( UPGRADE_URL, recordUpgradeClick ) ).not.toThrow();
		expect( mockOpen ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
	} );
} );

describe( 'useChatNotice', () => {
	it( 'stays silent until the backend reports a recognized exhaustion', () => {
		const { result } = renderHook( () => useChatNotice( { error: null } ) );

		expect( result.current ).toBeUndefined();
	} );

	it.each( [
		QUOTA_ERROR,
		'Protocol request error: ai_credit_allowance_exhausted.',
		'Streaming error: jetpack_ai_quota_exhausted.',
		'You have used all AI credits included with this site for this month.',
	] )( 'recognizes the backend exhaustion: %s', ( error ) => {
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
		'Unexpected payload contained ai_credit_allowance_exhausted metadata.',
		'jetpack_ai_quota_exhaustedness is not a supported code.',
	] )( 'does not swallow an unrelated error: %s', ( error ) => {
		const { result } = renderHook( () => useChatNotice( { error } ) );

		expect( result.current ).toBeUndefined();
	} );

	it( 'latches the notice after Agenttic clears the transient error', () => {
		const { result, rerender } = renderHook(
			( { error }: { error: string | null } ) => useChatNotice( { error } ),
			{ initialProps: { error: QUOTA_ERROR as string | null } }
		);

		rerender( { error: null } );

		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: false,
		} );
	} );

	it( 'suppresses a stale rejection after recovery and latches a later rejection', () => {
		const { result, rerender } = renderHook(
			( props: { error: string | null; recoveryRevision: number } ) =>
				useChatNotice( { ...props, scopeKey: 'site-123' } ),
			{
				initialProps: {
					error: QUOTA_ERROR as string | null,
					recoveryRevision: 0,
				},
			}
		);

		rerender( { error: QUOTA_ERROR, recoveryRevision: 1 } );
		expect( result.current ).toEqual( { suppressCurrentError: true } );

		rerender( { error: null, recoveryRevision: 1 } );
		expect( result.current ).toBeUndefined();

		rerender( { error: QUOTA_ERROR, recoveryRevision: 1 } );
		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: true,
		} );
	} );

	it( 'does not carry a latched rejection into another site scope', () => {
		const { result, rerender } = renderHook(
			( { error, scopeKey }: { error: string | null; scopeKey: string } ) =>
				useChatNotice( { error, scopeKey } ),
			{ initialProps: { error: QUOTA_ERROR as string | null, scopeKey: 'site-123' } }
		);

		rerender( { error: null, scopeKey: 'site-456' } );

		expect( result.current ).toBeUndefined();
	} );

	it( 'opens only a trusted URL extracted from the rejection', () => {
		const recordUpgradeClick = jest.fn();
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ QUOTA_ERROR } Ignore https://evil.example/checkout. Upgrade at ${ UPGRADE_URL }.`,
				recordUpgradeClick,
			} )
		);

		result.current?.action?.onClick();

		expect( recordUpgradeClick ).toHaveBeenCalledTimes( 1 );
		expect( mockOpen ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
	} );

	it( 'does not offer an action for an untrusted URL', () => {
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ QUOTA_ERROR } Upgrade at https://wordpress.com.evil.example/checkout`,
			} )
		);

		expect( result.current?.action ).toBeUndefined();
	} );
} );
