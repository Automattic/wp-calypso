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

const buildReturningPage = ( {
	pathname = '/signin/oauth/id',
	buttonText = '',
	accountVisible = false,
	textboxText = '',
	challengeText = '',
	closed = false,
} = {} ) => {
	const consentClick = jest.fn< () => Promise< void > >().mockResolvedValue();
	const accountClick = jest.fn< () => Promise< void > >().mockResolvedValue();
	let consentMatcher: RegExp;
	const consentVisible = jest.fn( async () => consentMatcher.test( buttonText ) );
	const locator = ( visible: () => Promise< boolean >, click = consentClick ) => {
		const result = { first: () => result, isVisible: visible, click };
		return result;
	};
	const page = {
		url: () => `https://accounts.google.com${ pathname }`,
		isClosed: () => closed,
		getByRole: ( role: string, { name }: { name: RegExp } ) => {
			if ( role === 'textbox' ) {
				return locator( async () => name.test( textboxText ) );
			}
			consentMatcher = name;
			return locator( consentVisible );
		},
		getByText: ( name: string | RegExp, options?: { exact: boolean } ) => {
			return typeof name === 'string'
				? locator(
						async () => name === 'person@example.test' && options?.exact === true && accountVisible,
						accountClick
				  )
				: locator( async () => name.test( challengeText ) );
		},
	} as unknown as Page;
	return { page, consentClick, accountClick, consentVisible };
};

describe( 'GoogleLoginPage', () => {
	describe( 'returning Google sessions', () => {
		test.each( [ 'Continue', 'Allow' ] )( 'accepts exact %s consent', async ( buttonText ) => {
			const { page, consentClick, accountClick } = buildReturningPage( { buttonText } );

			await new GoogleLoginPage( page ).continueWithSession( 'person@example.test' );

			expect( consentClick ).toHaveBeenCalledTimes( 1 );
			expect( accountClick ).not.toHaveBeenCalled();
		} );

		test( 'ignores unrelated buttons and account text outside the chooser', async () => {
			const { page, consentClick, accountClick } = buildReturningPage( {
				buttonText: 'Continue to another app',
				accountVisible: true,
			} );

			await new GoogleLoginPage( page ).continueWithSession( 'person@example.test' );

			expect( consentClick ).not.toHaveBeenCalled();
			expect( accountClick ).not.toHaveBeenCalled();
		} );

		test.each( [ true, false ] )(
			'selects the expected chooser account only when visible: %s',
			async ( accountVisible ) => {
				const { page, accountClick } = buildReturningPage( {
					pathname: '/accountchooser',
					accountVisible,
				} );

				await new GoogleLoginPage( page ).continueWithSession( 'person@example.test' );

				expect( accountClick ).toHaveBeenCalledTimes( accountVisible ? 1 : 0 );
			}
		);

		test.each( [ 'Enter your password', 'Email or phone' ] )(
			'requires renewal for %s without submitting credentials',
			async ( textboxText ) => {
				const { page, consentClick, accountClick } = buildReturningPage( {
					textboxText,
					buttonText: 'Continue',
				} );

				await expect(
					new GoogleLoginPage( page ).continueWithSession( 'person@example.test' )
				).rejects.toThrow( 'Google session requires renewal' );
				expect( consentClick ).not.toHaveBeenCalled();
				expect( accountClick ).not.toHaveBeenCalled();
			}
		);

		test.each( [ "Confirm you're not a robot", 'Confirm you’re not a robot' ] )(
			'requires renewal for human verification: %s',
			async ( challengeText ) => {
				const { page, consentClick } = buildReturningPage( {
					challengeText,
					buttonText: 'Continue',
				} );

				await expect(
					new GoogleLoginPage( page ).continueWithSession( 'person@example.test' )
				).rejects.toThrow( 'Google session requires renewal' );
				expect( consentClick ).not.toHaveBeenCalled();
			}
		);

		test.each( [ '/signin/challenge/totp', '/signin/rejected', '/signin/identifier' ] )(
			'requires renewal for %s',
			async ( pathname ) => {
				const { page, consentClick } = buildReturningPage( { pathname, buttonText: 'Continue' } );

				await expect(
					new GoogleLoginPage( page ).continueWithSession( 'person@example.test' )
				).rejects.toThrow( 'Google session requires renewal' );
				expect( consentClick ).not.toHaveBeenCalled();
			}
		);

		test.each( [ true, false ] )(
			'ignores a failed consent operation only after popup closure: %s',
			async ( closed ) => {
				const { page, consentClick } = buildReturningPage( { buttonText: 'Continue', closed } );
				consentClick.mockRejectedValue( new Error( 'private browser details' ) );
				const result = await new GoogleLoginPage( page )
					.continueWithSession( 'person@example.test' )
					.catch( ( error ) => error );

				expect( result ).toEqual(
					closed
						? undefined
						: new Error(
								'Google returning-session interaction failure; private details suppressed.'
						  )
				);
			}
		);
	} );

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
