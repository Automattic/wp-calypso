/**
 * Tests for useErrorNotice hook and getVideoGenerationErrorMessage helper
 *
 * Tests the error notice display logic:
 * - No-op when error is falsy
 * - Plain errors show as snackbar
 * - Errors with URLs show "Learn more" action
 * - Upgrade URLs show persistent warning notice with correct label
 * - Video mode maps raw error codes to user-friendly sentence-case messages
 * - Video mode adds "Try again" action when onRetry is provided
 */
import { renderHook } from '@testing-library/react';
import { getVideoGenerationErrorMessage, useErrorNotice } from './use-error-notice';

jest.mock( '@wordpress/element', () => ( {
	useEffect: ( fn: () => void ) => fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( 'useErrorNotice', () => {
	let mockAddNotice: jest.Mock;

	beforeEach( () => {
		mockAddNotice = jest.fn();
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
				},
			] );
		} );

		it( 'handles object with message property', () => {
			const error = { message: 'Custom error object' };
			renderHook( () => useErrorNotice( error, mockAddNotice ) );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Custom error object', 'error' );
		} );
	} );

	describe( 'video mode — user-friendly messages', () => {
		it( 'maps "network error" to a connection-specific message', () => {
			renderHook( () =>
				useErrorNotice( 'Streaming error: network error', mockAddNotice, { isVideoMode: true } )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Video generation failed. Check your connection and try again.',
				'error',
				undefined
			);
		} );

		it( 'maps "Failed to fetch" to a connection-specific message', () => {
			renderHook( () =>
				useErrorNotice( new Error( 'Failed to fetch' ), mockAddNotice, { isVideoMode: true } )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Video generation failed. Check your connection and try again.',
				'error',
				undefined
			);
		} );

		it( 'maps content_policy_violation to a prompt-adjustment message', () => {
			renderHook( () =>
				useErrorNotice(
					'Streaming error: content_policy_violation',
					mockAddNotice,
					{ isVideoMode: true }
				)
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				"Your prompt contains content that can't be generated. Try a different description.",
				'error',
				undefined
			);
		} );

		it( 'maps server_error to a server-side failure message', () => {
			renderHook( () =>
				useErrorNotice( 'Streaming error: server_error', mockAddNotice, { isVideoMode: true } )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Something went wrong on our end. Please try again.',
				'error',
				undefined
			);
		} );

		it( 'maps invalid_input to a prompt-rewording message', () => {
			renderHook( () =>
				useErrorNotice( 'Streaming error: invalid_input', mockAddNotice, { isVideoMode: true } )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				"We couldn't process your request. Try rewording your prompt.",
				'error',
				undefined
			);
		} );

		it( 'uses generic fallback for unrecognised errors in video mode', () => {
			renderHook( () =>
				useErrorNotice( 'Streaming error: unknown_thing_happened', mockAddNotice, {
					isVideoMode: true,
				} )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Video generation failed. Please try again.',
				'error',
				undefined
			);
		} );

		it( 'still shows upgrade notice (warning) in video mode when an upgrade URL is present', () => {
			renderHook( () =>
				useErrorNotice(
					'Streaming error: Limit reached https://wordpress.com/upgrade/premium',
					mockAddNotice,
					{ isVideoMode: true }
				)
			);

			// Upgrade URL path takes priority over video-mode message mapping
			expect( mockAddNotice ).toHaveBeenCalledWith( 'Limit reached', 'warning', [
				{
					label: 'Upgrade plan',
					url: 'https://wordpress.com/upgrade/premium',
					openInNewTab: true,
				},
			] );
		} );
	} );

	describe( 'video mode — Try again button', () => {
		it( 'adds a "Try again" action when onRetry is provided in video mode', () => {
			const mockRetry = jest.fn();
			renderHook( () =>
				useErrorNotice( 'Streaming error: network error', mockAddNotice, {
					isVideoMode: true,
					onRetry: mockRetry,
				} )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Video generation failed. Check your connection and try again.',
				'error',
				[ { label: 'Try again', onClick: mockRetry } ]
			);
		} );

		it( 'calls the onRetry handler when the action onClick is invoked', () => {
			const mockRetry = jest.fn();
			renderHook( () =>
				useErrorNotice( 'Streaming error: server_error', mockAddNotice, {
					isVideoMode: true,
					onRetry: mockRetry,
				} )
			);

			// Extract the onClick from the notice action and invoke it
			const [ , , actions ] = mockAddNotice.mock.calls[ 0 ];
			actions[ 0 ].onClick();
			expect( mockRetry ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not add "Try again" action in video mode when onRetry is omitted', () => {
			renderHook( () =>
				useErrorNotice( 'Streaming error: network error', mockAddNotice, { isVideoMode: true } )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Video generation failed. Check your connection and try again.',
				'error',
				undefined
			);
		} );

		it( 'does not add "Try again" action in non-video mode even when onRetry is provided', () => {
			const mockRetry = jest.fn();
			renderHook( () =>
				useErrorNotice( 'Something went wrong', mockAddNotice, {
					isVideoMode: false,
					onRetry: mockRetry,
				} )
			);

			// Non-video mode ignores onRetry — shows raw message without retry action
			expect( mockAddNotice ).toHaveBeenCalledWith( 'Something went wrong', 'error' );
		} );
	} );
} );

describe( 'getVideoGenerationErrorMessage', () => {
	it( 'maps "network error" (lowercase) to a connection message', () => {
		expect( getVideoGenerationErrorMessage( 'network error' ) ).toBe(
			'Video generation failed. Check your connection and try again.'
		);
	} );

	it( 'maps "Failed to fetch" to a connection message', () => {
		expect( getVideoGenerationErrorMessage( 'Failed to fetch' ) ).toBe(
			'Video generation failed. Check your connection and try again.'
		);
	} );

	it( 'maps "NetworkError when attempting to fetch resource." (Firefox) to a connection message', () => {
		expect(
			getVideoGenerationErrorMessage( 'NetworkError when attempting to fetch resource.' )
		).toBe( 'Video generation failed. Check your connection and try again.' );
	} );

	it( 'maps "internet connection" to a connection message', () => {
		expect( getVideoGenerationErrorMessage( 'The internet connection appears to be offline.' ) ).toBe(
			'Video generation failed. Check your connection and try again.'
		);
	} );

	it( 'maps "content_policy_violation" to a prompt-adjustment message', () => {
		expect( getVideoGenerationErrorMessage( 'content_policy_violation' ) ).toBe(
			"Your prompt contains content that can't be generated. Try a different description."
		);
	} );

	it( 'maps "safety" keyword to a prompt-adjustment message', () => {
		expect( getVideoGenerationErrorMessage( 'safety filter triggered' ) ).toBe(
			"Your prompt contains content that can't be generated. Try a different description."
		);
	} );

	it( 'maps "server_error" to a server-side failure message', () => {
		expect( getVideoGenerationErrorMessage( 'server_error' ) ).toBe(
			'Something went wrong on our end. Please try again.'
		);
	} );

	it( 'maps "service_unavailable" to a server-side failure message', () => {
		expect( getVideoGenerationErrorMessage( 'service_unavailable' ) ).toBe(
			'Something went wrong on our end. Please try again.'
		);
	} );

	it( 'maps "internal error" to a server-side failure message', () => {
		expect( getVideoGenerationErrorMessage( 'internal error occurred' ) ).toBe(
			'Something went wrong on our end. Please try again.'
		);
	} );

	it( 'maps "invalid_input" to a prompt-rewording message', () => {
		expect( getVideoGenerationErrorMessage( 'invalid_input' ) ).toBe(
			"We couldn't process your request. Try rewording your prompt."
		);
	} );

	it( 'maps "validation" to a prompt-rewording message', () => {
		expect( getVideoGenerationErrorMessage( 'validation error in prompt' ) ).toBe(
			"We couldn't process your request. Try rewording your prompt."
		);
	} );

	it( 'returns a generic fallback for unknown error codes', () => {
		expect( getVideoGenerationErrorMessage( 'some_unknown_code' ) ).toBe(
			'Video generation failed. Please try again.'
		);
	} );

	it( 'returns a generic fallback for empty string', () => {
		expect( getVideoGenerationErrorMessage( '' ) ).toBe(
			'Video generation failed. Please try again.'
		);
	} );
} );
