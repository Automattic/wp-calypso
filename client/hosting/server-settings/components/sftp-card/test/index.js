/**
 * @jest-environment jsdom
 */

import { FEATURE_SFTP, FEATURE_SSH } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SftpCard } from '../card';

jest.mock( '@automattic/components/src/spinner', () => ( {
	__esModule: true,
	Spinner: () => <div data-testid="spinner" />,
} ) );

jest.mock( 'calypso/launchpad/hooks/use-complete-launchpad-tasks-with-notice', () => ( {
	useCompleteLaunchpadTasksWithNotice: () => jest.fn(),
} ) );

const INITIAL_STATE = {
	ui: { selectedSiteId: 1 },
	currentUser: { id: 1 },
	sites: {},
};

const mockStore = configureStore();
const defaultStore = mockStore( INITIAL_STATE );
const storeWithUsername = mockStore( {
	...INITIAL_STATE,
	atomicHosting: {
		1: { sftpUsers: [ { username: 'testuser' } ] },
	},
} );

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

	function renderWithProvider( props, store = defaultStore ) {
		render(
			<Provider store={ store }>
				<SftpCard { ...props } />
			</Provider>
		);
	}

	describe( 'Sftp Questions', () => {
		it( 'should display sftp questions if no sftp username', async () => {
			const store = mockStore( {
				...INITIAL_STATE,
				atomicHosting: {
					1: { sftpUsers: [ { username: null } ] },
				},
			} );

			renderWithProvider( {}, store );

			expect( screen.getByText( 'What is SFTP?' ) ).toBeVisible();
			expect( screen.getByText( 'What is SSH?' ) ).toBeVisible();
		} );

		it( 'should not display sftp questions if sftp username is set', () => {
			renderWithProvider( {}, storeWithUsername );

			expect( screen.queryByText( 'What is SFTP?' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'What is SSH?' ) ).not.toBeInTheDocument();
		} );

		it( 'should not display sftp questions if loading', () => {
			const store = mockStore( {
				...INITIAL_STATE,
				sites: {
					features: {
						1: {
							data: {
								active: [ FEATURE_SFTP, FEATURE_SSH ],
							},
						},
					},
				},
				atomicHosting: {
					1: { isLoadingSftpUsers: true },
				},
			} );

			renderWithProvider( {}, store );

			expect( screen.queryByText( 'What is SFTP?' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'What is SSH?' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Loading', () => {
		it( 'should display spinner if username not set and not disabled', () => {
			renderWithProvider( {} );

			expect( screen.queryByTestId( 'spinner' ) ).toBeVisible();
		} );

		it( 'should not display spinner if disabled', () => {
			renderWithProvider( { disabled: true } );

			expect( screen.queryByTestId( 'spinner' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Create SFTP credentials', () => {
		const btnName = 'Create credentials';

		it( 'should display create SFTP credentials if username not set', () => {
			renderWithProvider( { disabled: true } );

			expect( screen.getByRole( 'button', { name: btnName } ) ).toBeVisible();
		} );

		it( 'should not display create SFTP credentials if username set', () => {
			renderWithProvider( {}, storeWithUsername );

			expect( screen.queryByRole( 'button', { name: btnName } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'User info fields', () => {
		it( 'should display user info fields if username set', () => {
			renderWithProvider( {}, storeWithUsername );

			expect( screen.getByLabelText( 'URL' ) ).toHaveValue( 'sftp.wp.com' );
			expect( screen.getByLabelText( 'Port' ) ).toHaveValue( '22' );
			expect( screen.getByLabelText( 'Username' ) ).toHaveValue( 'testuser' );
		} );

		it( 'should not display user info fields if username not set', () => {
			renderWithProvider();

			expect( screen.queryByLabelText( 'URL' ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( 'Port' ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( 'Username' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Password', () => {
		it( 'should display password field if password set', () => {
			const store = mockStore( {
				...INITIAL_STATE,
				atomicHosting: {
					1: { sftpUsers: [ { username: 'testuser', password: 'secret' } ] },
				},
			} );

			renderWithProvider( {}, store );

			expect( screen.getByLabelText( 'Password' ) ).toBeVisible();
		} );

		it( 'should not display password field if password not set', () => {
			renderWithProvider( {}, storeWithUsername );

			expect( screen.queryByLabelText( 'Password' ) ).not.toBeInTheDocument();
		} );

		it( 'should display password reset button if password not set', () => {
			renderWithProvider( {}, storeWithUsername );

			expect( screen.getByRole( 'button', { name: 'Reset password' } ) ).toBeVisible();
		} );
	} );
} );
