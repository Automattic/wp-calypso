/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { SftpCard } from '..';

jest.mock( '@automattic/components/src/spinner', () => ( {
	__esModule: true,
	Spinner: () => <div data-testid="spinner" />,
} ) );

const translate = ( x ) => x;
const requestSftpUsers = ( x ) => x;
const removePasswordFromState = ( x ) => x;

const props = {
	translate,
	requestSftpUsers,
	removePasswordFromState,
};

describe( 'SftpCard', () => {
	beforeAll( () => {
		// Mock the missing `window.matchMedia` function that's not even in JSDOM
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( ( query ) => ( {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} ) ),
		} );
	} );

	describe( 'Sftp Questions', () => {
		it( 'should display sftp questions if no sftp username', async () => {
			render( <SftpCard { ...props } username={ null } /> );

			expect( screen.getByText( 'What is SFTP?' ) ).toBeVisible();
			expect( screen.getByText( 'What is SSH?' ) ).toBeVisible();
		} );

		it( 'should not display sftp questions if sftp username is set', () => {
			render( <SftpCard { ...props } username="testuser" /> );

			expect( screen.queryByText( 'What is SFTP?' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'What is SSH?' ) ).not.toBeInTheDocument();
		} );

		it( 'should not display sftp questions if loading', () => {
			render( <SftpCard { ...props } /> );

			expect( screen.queryByText( 'What is SFTP?' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'What is SSH?' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Loading', () => {
		it( 'should display spinner if username not set and not disabled', () => {
			render( <SftpCard { ...props } /> );

			expect( screen.getByTestId( 'spinner' ) ).toBeVisible();
		} );

		it( 'should not display spinner if disabled', () => {
			render( <SftpCard { ...props } disabled={ true } /> );

			expect( screen.queryByTestId( 'spinner' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Create SFTP credentials', () => {
		const btnName = 'Create credentials';
		it( 'should display create SFTP credentials if username not set', () => {
			render( <SftpCard { ...props } username={ null } /> );

			expect( screen.getByRole( 'button', { name: btnName } ) ).toBeVisible();
		} );

		it( 'should not display create SFTP credentials if username set', () => {
			render( <SftpCard { ...props } username="testuser" /> );

			expect( screen.queryByRole( 'button', { name: btnName } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'User info fields', () => {
		it( 'should display user info fields if username set', () => {
			render( <SftpCard { ...props } username="testuser" /> );

			expect( screen.getByLabelText( 'URL' ) ).toHaveValue( 'sftp.wp.com' );
			expect( screen.getByLabelText( 'Port' ) ).toHaveValue( '22' );
			expect( screen.getByLabelText( 'Username' ) ).toHaveValue( 'testuser' );
		} );

		it( 'should not display user info fields if username not set', () => {
			render( <SftpCard { ...props } /> );

			expect( screen.queryByLabelText( 'URL' ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( 'Port' ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( 'Username' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Password', () => {
		it( 'should display password field if password set', () => {
			render( <SftpCard { ...props } username="testuser" password="secret" /> );

			expect( screen.getByLabelText( 'Password' ) ).toBeVisible();
		} );

		it( 'should not display password field if password not set', () => {
			render( <SftpCard { ...props } username="testuser" /> );

			expect( screen.queryByLabelText( 'Password' ) ).not.toBeInTheDocument();
		} );

		it( 'should display password reset button if password not set', () => {
			render( <SftpCard { ...props } username="testuser" /> );

			expect( screen.getByRole( 'button', { name: 'Reset password' } ) ).toBeVisible();
		} );
	} );
} );
