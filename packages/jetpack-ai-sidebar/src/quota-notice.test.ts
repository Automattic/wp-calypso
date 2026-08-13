/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useChatNotice } from './quota-notice';
import { trackJetpackAiUpgrade } from './utils/tracking';

jest.mock( './utils/tracking', () => ( {
	trackJetpackAiUpgrade: jest.fn(),
} ) );

const mockTrackJetpackAiUpgrade = jest.mocked( trackJetpackAiUpgrade );
const mockAssign = jest.fn();
const CURRENT_ENDPOINT_ERROR =
	'Protocol request error: You have reached your Jetpack AI usage limit.';

beforeAll( () => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, assign: mockAssign },
	} );
} );

beforeEach( () => {
	mockTrackJetpackAiUpgrade.mockReset();
	mockAssign.mockReset();
} );

describe( 'useChatNotice', () => {
	it( 'stays silent until the backend rejects a request', () => {
		const { result } = renderHook( () => useChatNotice( { error: null } ) );

		expect( result.current ).toBeUndefined();
	} );

	it( 'recognizes the current backend rejection', () => {
		const { result } = renderHook( () => useChatNotice( { error: CURRENT_ENDPOINT_ERROR } ) );

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

	it.each( [
		'https://wordpress.com/checkout/example.com/ai-monthly',
		'https://jetpack.com/upgrade/ai',
	] )( 'uses a trusted backend upgrade URL: %s', ( upgradeUrl ) => {
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ CURRENT_ENDPOINT_ERROR } Upgrade at ${ upgradeUrl }`,
			} )
		);

		result.current?.action?.onClick();

		expect( mockTrackJetpackAiUpgrade ).toHaveBeenCalledWith();
		expect( mockAssign ).toHaveBeenCalledWith( upgradeUrl );
	} );

	it.each( [
		'https://wordpress.com.evil.example/checkout',
		'https://cdn.wordpress.com/checkout',
		'https://evil.example/checkout',
	] )( 'does not offer an action for an untrusted URL: %s', ( upgradeUrl ) => {
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ CURRENT_ENDPOINT_ERROR } Upgrade at ${ upgradeUrl }`,
			} )
		);

		expect( result.current?.action ).toBeUndefined();
	} );

	it( 'skips an untrusted URL and uses a later trusted URL', () => {
		const trustedUrl = 'https://wordpress.com/checkout/example.com/personal';
		const { result } = renderHook( () =>
			useChatNotice( {
				error: `${ CURRENT_ENDPOINT_ERROR } Ignore https://evil.example/checkout. Upgrade at ${ trustedUrl }`,
			} )
		);

		result.current?.action?.onClick();

		expect( mockAssign ).toHaveBeenCalledWith( trustedUrl );
	} );
} );
