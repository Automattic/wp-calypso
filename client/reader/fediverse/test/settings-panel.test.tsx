/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getLandingUrl } from '../route';
import { SettingsPanel } from '../settings-panel';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock( '@automattic/calypso-router', () => {
	const fn = jest.fn() as jest.Mock;
	return { __esModule: true, default: fn };
} );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string, options?: { args?: Record< string, string > } ) => {
		if ( options?.args ) {
			return Object.entries( options.args ).reduce(
				( result, [ key, value ] ) => result.replace( `%(${ key })s`, value ),
				str
			);
		}
		return str;
	},
} ) );

// Mock calypso/state to capture dispatch calls.
const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

// Mock analytics so we can assert on events without Redux.
jest.mock( '../analytics', () => ( {
	trackFediverseEvent: jest.fn( ( event, props ) => ( { type: 'TRACK', event, props } ) ),
} ) );

// Mock @wordpress/components with minimal implementations.
jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
	} ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ children }
		</button>
	),
	Card: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	CardBody: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	Spinner: () => <span role="status">Loading</span>,
	__experimentalVStack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

// ---------------------------------------------------------------------------
// Mocked hook factories — replaced per test.
// ---------------------------------------------------------------------------

const mockUseFediverseConnectionQuery = jest.fn();
const mockUseDisconnectFediverseMutation = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	useFediverseConnectionQuery: ( ...args: unknown[] ) => mockUseFediverseConnectionQuery( ...args ),
	useDisconnectFediverseMutation: ( ...args: unknown[] ) =>
		mockUseDisconnectFediverseMutation( ...args ),
} ) );

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const CONNECTION = {
	id: 42,
	handle: '@alice@example.social',
	site_host: 'example.social',
	actor_url: 'https://example.social/users/alice',
	avatar: '',
	blog_id: 123,
	actor_type: 'user' as const,
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe( 'SettingsPanel', () => {
	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		mockDispatch.mockClear();
		mockUseFediverseConnectionQuery.mockClear();
		mockUseDisconnectFediverseMutation.mockClear();

		// Default: idle mutation with no error.
		mockUseDisconnectFediverseMutation.mockReturnValue( {
			mutate: jest.fn(),
			isPending: false,
			isError: false,
		} );
	} );

	// -------------------------------------------------------------------------
	// 1. Pending state shows spinner
	// -------------------------------------------------------------------------

	it( 'shows a spinner while the connection is pending', () => {
		mockUseFediverseConnectionQuery.mockReturnValue( {
			data: undefined,
			isPending: true,
		} );

		render( <SettingsPanel connectionId={ 42 } /> );

		expect( screen.getByRole( 'status' ) ).toBeVisible();
		expect( screen.queryByRole( 'button' ) ).toBeNull();
	} );

	// -------------------------------------------------------------------------
	// 2. Connection loaded — shows handle and site_host
	// -------------------------------------------------------------------------

	it( 'renders the handle and site_host once the connection is loaded', () => {
		mockUseFediverseConnectionQuery.mockReturnValue( {
			data: CONNECTION,
			isPending: false,
		} );

		render( <SettingsPanel connectionId={ 42 } /> );

		expect( screen.getByText( '@alice@example.social' ) ).toBeVisible();
		expect( screen.getByText( 'example.social' ) ).toBeVisible();
	} );

	// -------------------------------------------------------------------------
	// 3. First click → button text changes to confirm copy
	// -------------------------------------------------------------------------

	it( 'changes button label to confirm copy on first click', async () => {
		const user = userEvent.setup();

		mockUseFediverseConnectionQuery.mockReturnValue( {
			data: CONNECTION,
			isPending: false,
		} );

		render( <SettingsPanel connectionId={ 42 } /> );

		const button = screen.getByRole( 'button', { name: 'Disconnect' } );
		await user.click( button );

		expect(
			screen.getByRole( 'button', { name: 'Are you sure? Click again to disconnect' } )
		).toBeVisible();
	} );

	// -------------------------------------------------------------------------
	// 4. Second click → mutation fires; on success, tracks + navigates
	// -------------------------------------------------------------------------

	it( 'fires the mutation on the second click, then tracks and navigates', async () => {
		const user = userEvent.setup();

		mockUseFediverseConnectionQuery.mockReturnValue( {
			data: CONNECTION,
			isPending: false,
		} );

		const mockMutate = jest.fn( ( _vars, { onSuccess } ) => onSuccess() );
		mockUseDisconnectFediverseMutation.mockReturnValue( {
			mutate: mockMutate,
			isPending: false,
			isError: false,
		} );

		render( <SettingsPanel connectionId={ 42 } /> );

		// First click: enter confirm state.
		await user.click( screen.getByRole( 'button', { name: 'Disconnect' } ) );
		// Second click: confirm.
		await user.click(
			screen.getByRole( 'button', { name: 'Are you sure? Click again to disconnect' } )
		);

		expect( mockMutate ).toHaveBeenCalledWith(
			undefined,
			expect.objectContaining( { onSuccess: expect.any( Function ) } )
		);
		expect( mockDispatch ).toHaveBeenCalledWith(
			expect.objectContaining( { type: 'TRACK', event: 'DISCONNECTED' } )
		);
		expect( page as unknown as jest.Mock ).toHaveBeenCalledWith( getLandingUrl() );
	} );

	// -------------------------------------------------------------------------
	// 5. Mutation error path shows the error message
	// -------------------------------------------------------------------------

	it( 'shows an error alert when the mutation has errored', () => {
		mockUseFediverseConnectionQuery.mockReturnValue( {
			data: CONNECTION,
			isPending: false,
		} );

		mockUseDisconnectFediverseMutation.mockReturnValue( {
			mutate: jest.fn(),
			isPending: false,
			isError: true,
		} );

		render( <SettingsPanel connectionId={ 42 } /> );

		expect( screen.getByRole( 'alert' ) ).toBeVisible();
		expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
			"We couldn't disconnect. Please try again."
		);
	} );
} );
