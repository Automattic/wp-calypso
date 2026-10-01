import { describe, expect, jest, test } from '@jest/globals';
import { GoogleLoginPage } from '../../../lib/pages/external/google-login-page';
import type { Page } from 'playwright';

const buildPage = ( challengeText = '' ) => {
	const timeout = new Error( 'Password locator timed out' );
	const type = jest.fn();
	const stableElement = {
		waitForElementState: jest.fn< () => Promise< void > >().mockResolvedValue(),
	};
	const elementHandle = jest
		.fn< () => Promise< typeof stableElement > >()
		.mockRejectedValue( timeout );
	const waitFor = jest.fn< () => Promise< void > >().mockResolvedValue();
	let challengeMatcher: RegExp;
	const isVisible = jest.fn( async () => challengeMatcher.test( challengeText ) );
	const challengeLocator = {
		first: () => ( { isVisible } ),
		isVisible: jest
			.fn< () => Promise< boolean > >()
			.mockRejectedValue( new Error( 'strict mode violation: multiple matching elements' ) ),
	};
	const page = {
		getByRole: jest.fn( () => ( { elementHandle, first: () => ( { waitFor } ), type } ) ),
		getByText: jest.fn( ( matcher: RegExp ) => {
			challengeMatcher = matcher;
			return challengeLocator;
		} ),
	} as unknown as Page;
	return { page, timeout, type, elementHandle, stableElement, isVisible };
};

describe( 'GoogleLoginPage', () => {
	test.each( [ 'Confirm you’re not a robot', "Confirm you're not a robot" ] )(
		'reports human verification and preserves its cause for duplicate text matches: %s',
		async ( challengeText ) => {
			const { page, timeout, type } = buildPage( challengeText );

			const error = await new GoogleLoginPage( page )
				.enterPassword( 'test-password' )
				.catch( ( error ) => error );
			expect( error ).toMatchObject( {
				message: 'Google human verification required before password entry.',
			} );
			expect( error.cause ).toBe( timeout );
			expect( type ).not.toHaveBeenCalled();
		}
	);

	test( 'preserves the original failure when the human verification screen is absent', async () => {
		const { page, timeout } = buildPage( 'Enter your password' );

		await expect( new GoogleLoginPage( page ).enterPassword( 'test-password' ) ).rejects.toBe(
			timeout
		);
	} );

	test( 'preserves the original failure when inspecting the challenge fails', async () => {
		const { page, timeout, isVisible } = buildPage();
		isVisible.mockRejectedValue( new Error( 'Page closed' ) );

		await expect( new GoogleLoginPage( page ).enterPassword( 'test-password' ) ).rejects.toBe(
			timeout
		);
	} );

	test( 'types the password when the password field is available', async () => {
		const { page, elementHandle, stableElement, type, isVisible } = buildPage();
		elementHandle.mockResolvedValue( stableElement );

		await new GoogleLoginPage( page ).enterPassword( 'test-password' );

		expect( type ).toHaveBeenCalledWith( 'test-password', { delay: 30 } );
		expect( isVisible ).not.toHaveBeenCalled();
	} );
} );
