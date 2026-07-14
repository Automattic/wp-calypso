/**
 * Tests for useErrorNotice hook
 *
 * Tests the error notice display logic:
 * - No-op when error is falsy
 * - Plain errors show as snackbar
 * - Errors with URLs show "Learn more" action
 * - Upgrade URLs show persistent warning notice with correct label
 */
import { renderHook } from '@testing-library/react';
import {
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
} from '../utils/tracking';
import { useErrorNotice } from './use-error-notice';

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useEffect: ( fn: () => void ) => fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioUpgradeNoticeShown: jest.fn(),
	trackImageStudioUpgradeNoticeClick: jest.fn(),
} ) );

describe( 'useErrorNotice', () => {
	let mockAddNotice: jest.Mock;

	beforeEach( () => {
		mockAddNotice = jest.fn();
		jest.clearAllMocks();
	} );

	describe( 'no error', () => {
		it( 'does not call addNotice when error is null', () => {
			renderHook( () => useErrorNotice( null, mockAddNotice ) );
			expect( mockAddNotice ).not.toHaveBeenCalled();
		} );

		it( 'does not call addNotice when error is undefined', () => {
			renderHook( () => useErrorNotice( undefined, mockAddNotice ) );
			expect( mockAddNotice ).not.toHaveBeenCalled();
		} );

		it( 'does not call addNotice when error is empty string', () => {
			renderHook( () => useErrorNotice( '', mockAddNotice ) );
			expect( mockAddNotice ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'plain errors without URL', () => {
		it( 'shows error snackbar for plain error message', () => {
			renderHook( () => useErrorNotice( 'Something went wrong', mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Something went wrong', 'error' );
		} );

		it( 'extracts message from Error object', () => {
			const error = new Error( 'Network failure' );
			renderHook( () => useErrorNotice( error, mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Network failure', 'error' );
		} );

		it( 'converts non-string errors to string', () => {
			renderHook( () => useErrorNotice( 42, mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( '42', 'error' );
		} );

		it( 'strips "Streaming error:" prefix from message', () => {
			renderHook( () => useErrorNotice( 'Streaming error: Connection lost', mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Connection lost', 'error' );
		} );
	} );

	describe( 'errors with non-upgrade URLs', () => {
		it( 'shows error snackbar with "Learn more" action for allowed domain', () => {
			renderHook( () =>
				useErrorNotice(
					'Error occurred. See https://wordpress.com/help for details.',
					mockAddNotice
				)
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Error occurred. See for details.', 'error', [
				{
					label: 'Learn more',
					url: 'https://wordpress.com/help',
					openInNewTab: true,
				},
			] );
		} );

		it( 'extracts URL from middle of message', () => {
			renderHook( () =>
				useErrorNotice( 'Visit https://jetpack.com/docs for help', mockAddNotice )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Visit for help', 'error', [
				{
					label: 'Learn more',
					url: 'https://jetpack.com/docs',
					openInNewTab: true,
				},
			] );
		} );

		it( 'shows plain error when URL domain is not allowed', () => {
			renderHook( () =>
				useErrorNotice( 'Error occurred. See https://example.com/help for details.', mockAddNotice )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Error occurred. See for details.', 'error' );
		} );
	} );

	describe( 'errors with upgrade URLs', () => {
		it( 'shows warning notice with "See plans" for /plans/ URL', () => {
			renderHook( () =>
				useErrorNotice( 'Upgrade required https://wordpress.com/plans/example.com', mockAddNotice )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Upgrade required', 'warning', [
				{
					label: 'See plans',
					url: 'https://wordpress.com/plans/example.com',
					openInNewTab: true,
					onClick: expect.any( Function ),
				},
			] );
		} );

		it( 'shows warning notice with "Upgrade plan" for /upgrade URL', () => {
			renderHook( () =>
				useErrorNotice( 'Upgrade required https://wordpress.com/upgrade/premium', mockAddNotice )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Upgrade required', 'warning', [
				{
					label: 'Upgrade plan',
					url: 'https://wordpress.com/upgrade/premium',
					openInNewTab: true,
					onClick: expect.any( Function ),
				},
			] );
		} );

		it( 'shows warning notice with "Upgrade plan" for jetpack.com/redirect URL', () => {
			renderHook( () =>
				useErrorNotice(
					'Limit reached https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
					mockAddNotice
				)
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Limit reached', 'warning', [
				{
					label: 'Upgrade plan',
					url: 'https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
					openInNewTab: true,
					onClick: expect.any( Function ),
				},
			] );
		} );

		it( 'shows warning notice with "Upgrade plan" for my-jetpack URL on current origin', () => {
			const savedOrigin = window.location.origin;
			Object.defineProperty( window, 'location', {
				value: { origin: 'https://example.com' },
				writable: true,
			} );

			try {
				renderHook( () =>
					useErrorNotice(
						'Please upgrade https://example.com/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
						mockAddNotice
					)
				);

				expect( mockAddNotice ).toHaveBeenCalledWith( 'Please upgrade', 'warning', [
					{
						label: 'Upgrade plan',
						url: 'https://example.com/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai',
						openInNewTab: true,
						onClick: expect.any( Function ),
					},
				] );
			} finally {
				Object.defineProperty( window, 'location', {
					value: new URL( savedOrigin ),
					writable: true,
				} );
			}
		} );

		it( 'handles real-world streaming error with upgrade URL', () => {
			renderHook( () =>
				useErrorNotice(
					'Streaming error: Congratulations on exploring Image Studio and reaching the free requests limit! Upgrade now to keep using it. https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
					mockAddNotice
				)
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Congratulations on exploring Image Studio and reaching the free requests limit! Upgrade now to keep using it.',
				'warning',
				[
					{
						label: 'Upgrade plan',
						url: 'https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
						openInNewTab: true,
						onClick: expect.any( Function ),
					},
				]
			);
		} );
	} );

	describe( 'edge cases', () => {
		it( 'handles Error object with upgrade URL in message', () => {
			const error = new Error(
				'Quota exceeded. Upgrade at https://wordpress.com/plans/example.com'
			);
			renderHook( () => useErrorNotice( error, mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Quota exceeded. Upgrade at', 'warning', [
				{
					label: 'See plans',
					url: 'https://wordpress.com/plans/example.com',
					openInNewTab: true,
					onClick: expect.any( Function ),
				},
			] );
		} );

		it( 'handles object with message property', () => {
			const error = { message: 'Custom error object' };
			renderHook( () => useErrorNotice( error, mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Custom error object', 'error' );
		} );
	} );

	describe( 'upgrade notice tracking', () => {
		it( 'tracks the notice impression for upgrade URLs', () => {
			renderHook( () =>
				useErrorNotice(
					'Limit reached https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
					mockAddNotice
				)
			);

			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'wires the click tracker as the action onClick', () => {
			renderHook( () =>
				useErrorNotice(
					'Limit reached https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge',
					mockAddNotice
				)
			);

			const actions = mockAddNotice.mock.calls[ 0 ][ 2 ];
			expect( actions[ 0 ].onClick ).toBe( trackImageStudioUpgradeNoticeClick );
		} );

		it( 'does not track impressions for plain errors', () => {
			renderHook( () => useErrorNotice( 'Something went wrong', mockAddNotice ) );

			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
		} );

		it( 'tracks one impression per distinct message, not per repeated error', () => {
			const { rerender } = renderHook( ( { error } ) => useErrorNotice( error, mockAddNotice ), {
				initialProps: {
					error: new Error(
						'Limit reached https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge'
					),
				},
			} );
			// A fresh error object with the same message re-runs the effect but,
			// like the store's content de-dupe, must not count a new impression.
			rerender( {
				error: new Error(
					'Limit reached https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge'
				),
			} );

			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'tracks a second impression when the message differs', () => {
			const { rerender } = renderHook( ( { error } ) => useErrorNotice( error, mockAddNotice ), {
				initialProps: {
					error: new Error(
						'Limit reached https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge'
					),
				},
			} );
			rerender( {
				error: new Error( 'Upgrade required https://wordpress.com/plans/example.com' ),
			} );

			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'does not track impressions for non-upgrade URL errors', () => {
			renderHook( () =>
				useErrorNotice( 'Visit https://jetpack.com/docs for help', mockAddNotice )
			);

			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
		} );
	} );
} );
