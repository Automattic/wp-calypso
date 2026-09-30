import { describe, expect, jest, test } from '@jest/globals';
import { GoogleLoginPage } from '../../../lib/pages/external/google-login-page';
import type { Page } from 'playwright';

const buildPage = ( challengeVisible: boolean ) => {
	const timeout = new Error( 'Password locator timed out' );
	const type = jest.fn();
	const elementHandle = jest.fn< () => Promise< null > >().mockRejectedValue( timeout );
	const waitFor = jest.fn< () => Promise< void > >().mockResolvedValue();
	const isVisible = jest.fn< () => Promise< boolean > >().mockResolvedValue( challengeVisible );
	const page = {
		getByRole: jest.fn( () => ( { elementHandle, first: () => ( { waitFor } ), type } ) ),
		getByText: jest.fn( () => ( {
			isVisible,
		} ) ),
	} as unknown as Page;
	return { page, timeout, type, elementHandle, waitFor, isVisible };
};

describe( 'GoogleLoginPage', () => {
	test( 'reports human verification when Google shows its challenge before the password', async () => {
		const { page, type } = buildPage( true );

		await expect( new GoogleLoginPage( page ).enterPassword( 'test-password' ) ).rejects.toThrow(
			'Google human verification required before password entry.'
		);
		expect( type ).not.toHaveBeenCalled();
	} );

	test( 'preserves the original failure when the human verification screen is absent', async () => {
		const { page, timeout } = buildPage( false );

		await expect( new GoogleLoginPage( page ).enterPassword( 'test-password' ) ).rejects.toBe(
			timeout
		);
	} );

	test( 'preserves the original failure when inspecting the challenge fails', async () => {
		const { page, timeout, isVisible } = buildPage( false );
		isVisible.mockRejectedValue( new Error( 'Page closed' ) );

		await expect( new GoogleLoginPage( page ).enterPassword( 'test-password' ) ).rejects.toBe(
			timeout
		);
	} );

	test( 'reports human verification when waiting for the password to become visible fails', async () => {
		const { page, timeout, elementHandle, waitFor, type } = buildPage( true );
		elementHandle.mockResolvedValue( null );
		waitFor.mockRejectedValue( timeout );

		await expect( new GoogleLoginPage( page ).enterPassword( 'test-password' ) ).rejects.toThrow(
			'Google human verification required before password entry.'
		);
		expect( type ).not.toHaveBeenCalled();
	} );

	test( 'types the password when the password field is available', async () => {
		const { page, elementHandle, type, isVisible } = buildPage( false );
		elementHandle.mockResolvedValue( null );

		await new GoogleLoginPage( page ).enterPassword( 'test-password' );

		expect( type ).toHaveBeenCalledWith( 'test-password', { delay: 30 } );
		expect( isVisible ).not.toHaveBeenCalled();
	} );
} );
