/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { HelpCenter } from '@automattic/data-stores';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import CaptureInput from '../capture-input';

const mockedRecordTracksEvent = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args ) => mockedRecordTracksEvent( ...args ),
} ) );

const HELP_CENTER_STORE = HelpCenter.register();
const SIGNED_IN = { currentUser: { id: 1, user: { ID: 1 } } };

describe( 'CaptureInput', () => {
	beforeEach( () => jest.resetAllMocks() );

	it( 'captures the site url', async () => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type(
			screen.getByLabelText( /Enter the URL of the site/ ),
			'https://example.wordpress.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( onInputEnter ).toHaveBeenCalledWith( 'https://example.wordpress.com' );
	} );

	it( 'preserves the URL and focus while busy and allows editing and submission afterward', async () => {
		const user = userEvent.setup();
		const onInputEnter = jest.fn();
		const { rerender } = render( <CaptureInput onInputEnter={ onInputEnter } />, {
			wrapper: MemoryRouter,
		} );
		const input = screen.getByRole( 'textbox' );
		const continueButton = screen.getByRole( 'button', { name: 'Continue' } );
		await user.type( input, 'https://example.com' );

		rerender( <CaptureInput onInputEnter={ onInputEnter } isBusy /> );

		expect( input ).toHaveFocus();
		expect( input ).toHaveAttribute( 'readonly' );
		expect( continueButton ).toHaveClass( 'is-busy' );
		expect( continueButton ).toHaveAttribute( 'aria-disabled', 'true' );
		await user.type( input, '/ignored{Enter}' );
		await user.click( continueButton );
		expect( input ).toHaveValue( 'https://example.com' );
		expect( onInputEnter ).not.toHaveBeenCalled();

		rerender( <CaptureInput onInputEnter={ onInputEnter } isBusy={ false } /> );

		expect( input ).not.toHaveAttribute( 'readonly' );
		expect( continueButton ).not.toHaveClass( 'is-busy' );
		expect( continueButton ).toHaveAttribute( 'aria-disabled', 'false' );
		await user.type( input, '/updated{Enter}' );
		expect( onInputEnter ).toHaveBeenCalledTimes( 1 );
		expect( onInputEnter ).toHaveBeenCalledWith( 'https://example.com/updated' );
	} );

	it( 'blocks platform selection while busy and restores it afterward', async () => {
		const user = userEvent.setup();
		const props = {
			onInputEnter: jest.fn(),
			onDontHaveSiteAddressClick: jest.fn(),
		};
		const { rerender } = render( <CaptureInput { ...props } isBusy />, {
			wrapper: MemoryRouter,
		} );
		const platformButton = screen.getByRole( 'button', { name: 'choose a content platform' } );

		expect( platformButton ).toHaveAttribute( 'aria-disabled', 'true' );
		await user.click( platformButton );
		expect( props.onDontHaveSiteAddressClick ).not.toHaveBeenCalled();

		rerender( <CaptureInput { ...props } isBusy={ false } /> );

		expect( platformButton ).toHaveAttribute( 'aria-disabled', 'false' );
		await user.click( platformButton );
		expect( props.onDontHaveSiteAddressClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'shows an custom input label', async () => {
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ jest.fn() } label="A custom label text" />
			</MemoryRouter>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( screen.getByLabelText( /A custom label text/ ) ).toBeInTheDocument();
	} );

	it( 'only records invalid urls once', async () => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		// enter an invalid URL
		await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), 'notaurl' );

		// try to submit the same value twice
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		// Now, enter a valid URL and confirm we can submit ok
		await userEvent.clear( screen.getByLabelText( /Enter the URL of the site/ ) );
		await userEvent.type(
			screen.getByLabelText( /Enter the URL of the site/ ),
			'https://example.wordpress.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( onInputEnter ).toHaveBeenCalledWith( 'https://example.wordpress.com' );

		expect( mockedRecordTracksEvent.mock.calls.length ).toBe( 1 );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_importer_capture_input_invalid',
			{ error_code: 'missing_tld' }
		);
	} );

	it( 'does not record a valid URL from the query string as invalid', async () => {
		render(
			<MemoryRouter initialEntries={ [ '/?from=example.com' ] }>
				<CaptureInput onInputEnter={ jest.fn() } hasError />
			</MemoryRouter>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'refuses a WordPress.com page instead of entering it', async () => {
		const onInputEnter = jest.fn();
		renderWithProvider(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type(
			screen.getByLabelText( /Enter the URL of the site/ ),
			'https://wordpress.com/home/example.com'
		);
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( onInputEnter ).not.toHaveBeenCalled();
		expect( screen.getByText( /WordPress\.com page, not your site/ ) ).toBeVisible();
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_importer_capture_input_invalid',
			{ error_code: 'wordpress_com_page' }
		);
	} );

	it( 'explains a handed-over WordPress.com page straight away', () => {
		renderWithProvider(
			<MemoryRouter initialEntries={ [ '/?from=wordpress.com/log-in' ] }>
				<CaptureInput onInputEnter={ jest.fn() } skipInitialChecking />
			</MemoryRouter>
		);

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'wordpress.com/log-in' );
		expect( screen.getByText( /WordPress\.com page, not your site/ ) ).toBeVisible();
		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'waits for Continue before explaining other handed-over addresses', async () => {
		render(
			<MemoryRouter initialEntries={ [ '/?from=myblog' ] }>
				<CaptureInput onInputEnter={ jest.fn() } skipInitialChecking />
			</MemoryRouter>
		);

		expect( screen.queryByText( /missing its domain extension/ ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( screen.getByText( /missing its domain extension/ ) ).toBeVisible();
	} );

	describe( 'support link on a WordPress.com page', () => {
		beforeEach( async () => {
			await dispatch( HELP_CENTER_STORE ).setShowHelpCenter( false, undefined, true );
		} );

		const enterWordPressComPage = async ( { initialState, onInputEnter = jest.fn() } = {} ) => {
			renderWithProvider(
				<MemoryRouter>
					<CaptureInput onInputEnter={ onInputEnter } />
				</MemoryRouter>,
				{ initialState }
			);
			await userEvent.type( screen.getByRole( 'textbox' ), 'wordpress.com/log-in' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		};

		it( 'reads as one sentence with the support words inside it', async () => {
			await enterWordPressComPage( { initialState: SIGNED_IN } );

			const supportButton = screen.getByRole( 'button', { name: 'contact our support' } );

			expect( supportButton.closest( '.is-error' ) ).toHaveTextContent(
				"That’s a WordPress.com page, not your site’s address. Please enter the address of the site you want to move, like 'example.com'. If your site is already on WordPress.com and you need help, contact our support."
			);
		} );

		it( 'opens the Odie chat on the same page for signed-in people', async () => {
			const onInputEnter = jest.fn();
			await enterWordPressComPage( { initialState: SIGNED_IN, onInputEnter } );

			await userEvent.click( screen.getByRole( 'button', { name: 'contact our support' } ) );

			await waitFor( () => {
				expect( select( HELP_CENTER_STORE ).isHelpCenterShown() ).toBe( true );
			} );
			expect( select( HELP_CENTER_STORE ).getNavigateToRoute().route ).toBe( '/odie' );
			expect( onInputEnter ).not.toHaveBeenCalled();
			expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_importer_capture_contact_support_click',
				{ is_logged_in: true }
			);
		} );

		it( 'links signed-out people to log in and then the Odie chat in a new tab', async () => {
			await enterWordPressComPage();

			const supportLink = screen.getByRole( 'link', { name: /contact our support/ } );

			expect( supportLink ).toHaveAttribute( 'href', '/sites?help-center=wapuu' );
			expect( supportLink ).toHaveAttribute( 'target', '_blank' );
			expect(
				screen.queryByRole( 'button', { name: 'contact our support' } )
			).not.toBeInTheDocument();

			await userEvent.click( supportLink );

			expect( select( HELP_CENTER_STORE ).isHelpCenterShown() ).toBe( false );
			expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_importer_capture_contact_support_click',
				{ is_logged_in: false }
			);
		} );

		it( 'goes away once the address has a different mistake', async () => {
			await enterWordPressComPage();
			expect( screen.getByRole( 'link', { name: /contact our support/ } ) ).toBeVisible();

			await userEvent.clear( screen.getByRole( 'textbox' ) );
			await userEvent.type( screen.getByRole( 'textbox' ), 'notaurl' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( screen.getByText( /missing its domain extension/ ) ).toBeVisible();
			expect(
				screen.queryByRole( 'link', { name: /contact our support/ } )
			).not.toBeInTheDocument();
		} );
	} );

	it( 'shows a custom CTA label', async () => {
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ jest.fn() } label="A custom label text" nextLabelText="XYZ" />
			</MemoryRouter>
		);

		expect( screen.getByRole( 'button', { name: /XYZ/ } ) ).toBeInTheDocument();
	} );
} );

describe( 'URL Validation', () => {
	it.each( [
		{
			input: 'myblog',
			error:
				"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'.",
		},
		{
			input: 'https://myblog',
			error:
				"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'.",
		},
		{
			input: 'user@example.com',
			error:
				"Looks like you might have added an email address. Please use a URL instead, like 'example.com'.",
		},
		{
			input: 'http://my^blog.com',
			error:
				'Looks like your URL has some invalid characters (like ~ or ^). Please delete them and try again.',
		},
		{
			input: 'ftp://example.com',
			error:
				"URLs usually start with http:// or https:// (rather than file:/, ftp://, or similar). Please try again with a URL like 'https://example.com'.",
		},
		{
			input: 'file:///C:/DEVELOPER/index.html',
			error:
				"URLs usually start with http:// or https:// (rather than file:/, ftp://, or similar). Please try again with a URL like 'https://example.com'.",
		},
		{
			input: 'https://xn--example.com',
			error:
				"Looks like you’ve added an internationalized domain name. Please try a standard URL instead (like 'example.com').",
		},
		{
			input: 'www.例子.测试',
			error:
				"Looks like you’ve added an internationalized domain name. Please try a standard URL instead (like 'example.com').",
		},
		{
			input: 'example.com-',
			error:
				"Please add a valid website address (like 'example.com'). Feel free to copy and paste it in if that helps.",
		},
	] )( 'shows error message "$error" when input URL is "$input"', async ( { input, error } ) => {
		const onInputEnter = jest.fn();
		render(
			<MemoryRouter>
				<CaptureInput onInputEnter={ onInputEnter } />
			</MemoryRouter>
		);

		await userEvent.type( screen.getByLabelText( /Enter the URL of the site/ ), input );
		await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );

		expect( screen.getByText( error ) ).toBeInTheDocument();
	} );
} );
