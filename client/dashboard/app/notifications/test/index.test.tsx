/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import Notifications from '../index';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => true,
} ) );

jest.mock( 'calypso/lib/wp', () => ( { __esModule: true, default: {} } ) );

jest.mock( '@automattic/notifications/src/app', () => ( {
	__esModule: true,
	default: () => <div data-testid="notifications-panel" />,
} ) );

const mockSetVisibility = jest.fn();
jest.mock( '@automattic/notifications/src/app/client', () => ( {
	subscribeUnseenCount: () => () => {},
	getClient: () => ( { setVisibility: mockSetVisibility } ),
} ) );

jest.mock( '../../help-center', () => ( {
	useHelpCenter: () => ( {
		isShown: false,
		setShowHelpCenter: jest.fn(),
	} ),
} ) );

const renderBell = () =>
	render( <Notifications />, {
		config: {
			...jest.requireActual( '../../context' ).APP_CONTEXT_DEFAULT_CONFIG,
			supports: {
				...jest.requireActual( '../../context' ).APP_CONTEXT_DEFAULT_CONFIG.supports,
				notifications: true,
				notificationsInbox: true,
			},
		},
	} );

const setPath = ( path: string ) => {
	window.history.pushState( {}, '', path );
};

describe( 'Notifications bell / inbox mutual exclusion', () => {
	afterEach( () => {
		setPath( '/' );
		mockSetVisibility.mockClear();
	} );

	it( 'opens the dropdown from the bell on a regular route', async () => {
		setPath( '/sites' );
		renderBell();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Notifications' } ) );

		expect( await screen.findByTestId( 'notifications-panel' ) ).toBeInTheDocument();
	} );

	it( 'does not open the dropdown while the inbox route is active', async () => {
		setPath( '/notifications' );
		renderBell();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Notifications' } ) );

		await waitFor( () => {
			expect( screen.queryByTestId( 'notifications-panel' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not open the dropdown while a note is selected in the path', async () => {
		setPath( '/notifications/12345' );
		renderBell();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Notifications' } ) );

		await waitFor( () => {
			expect( screen.queryByTestId( 'notifications-panel' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 're-asserts engine visibility for the inbox while its route is active', async () => {
		setPath( '/notifications' );
		renderBell();

		await waitFor( () => {
			expect( mockSetVisibility ).toHaveBeenCalledWith( { isShowing: true, isVisible: true } );
		} );
	} );

	it( 'does not touch engine visibility on other routes', async () => {
		setPath( '/sites' );
		renderBell();

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Notifications' } ) ).toBeInTheDocument();
		} );
		expect( mockSetVisibility ).not.toHaveBeenCalled();
	} );

	it( 'does not open the dropdown on an inbox detail route', async () => {
		setPath( '/notifications/123' );
		renderBell();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Notifications' } ) );

		await waitFor( () => {
			expect( screen.queryByTestId( 'notifications-panel' ) ).not.toBeInTheDocument();
		} );
	} );
} );
