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
import { useErrorNotice } from './use-error-notice';

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
		it( 'shows error snackbar with "Learn more" action', () => {
			renderHook( () =>
				useErrorNotice( 'Error occurred. See https://example.com/help for details.', mockAddNotice )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Error occurred. See for details.', 'error', [
				{
					label: 'Learn more',
					url: 'https://example.com/help',
					openInNewTab: true,
				},
			] );
		} );

		it( 'extracts URL from middle of message', () => {
			renderHook( () =>
				useErrorNotice( 'Visit https://docs.example.com for help', mockAddNotice )
			);

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Visit for help', 'error', [
				{
					label: 'Learn more',
					url: 'https://docs.example.com',
					openInNewTab: true,
				},
			] );
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

		it( 'shows warning notice with "Upgrade plan" for my-jetpack URL', () => {
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
} );
