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

jest.mock( '@automattic/notifications/src/app/client', () => ( {
	subscribeUnseenCount: () => () => {},
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

	it( 'does not open the dropdown on an inbox detail route', async () => {
		setPath( '/notifications/123' );
		renderBell();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Notifications' } ) );

		await waitFor( () => {
			expect( screen.queryByTestId( 'notifications-panel' ) ).not.toBeInTheDocument();
		} );
	} );
} );
