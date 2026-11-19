/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { useWaitHeartbeat } from 'calypso/lib/analytics/wait-heartbeat';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import TransferPending from '..';

const mockDispatch = jest.fn();
const mockPage = jest.fn();
let mockTransfer: { status?: string } = {};
let mockAdminUrl: string | null = 'https://example.wordpress.com/wp-admin/';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockPage( ...args ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/selectors/get-atomic-transfer', () => ( {
	__esModule: true,
	default: () => mockTransfer,
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: () => 'example.wordpress.com',
	getSiteAdminUrl: () => mockAdminUrl,
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( { __: ( text: string ) => text } ),
} ) );

jest.mock( 'calypso/components/loading', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/lib/analytics/wait-heartbeat', () => ( {
	useWaitHeartbeat: jest.fn(),
} ) );

jest.mock( 'calypso/lib/interval', () => ( {
	useInterval: jest.fn(),
} ) );

describe( 'TransferPending', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockTransfer = {};
		mockAdminUrl = 'https://example.wordpress.com/wp-admin/';
	} );

	test.each( [ transferStates.ERROR, transferStates.REVERTED ] )(
		'shows the failure for status %s on this screen, with a way to the dashboard',
		( status ) => {
			mockTransfer = { status };

			render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

			expect(
				screen.getByText( "Sorry, we couldn't process your transfer. Please try again later." )
			).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Go to your dashboard' } ) ).toHaveAttribute(
				'href',
				'https://example.wordpress.com/wp-admin/'
			);
			expect( mockPage ).not.toHaveBeenCalled();
		}
	);

	test( 'ends the wait once the failure is shown', () => {
		mockTransfer = { status: transferStates.ACTIVE };

		const { rerender } = render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( useWaitHeartbeat ).toHaveBeenLastCalledWith(
			expect.objectContaining( { enabled: true } )
		);

		mockTransfer = { status: transferStates.ERROR };
		rerender( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( useWaitHeartbeat ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				enabled: false,
				properties: expect.objectContaining( { transfer_status: transferStates.ERROR } ),
			} )
		);
	} );

	test( 'links to Home when the site has no known wp-admin address', () => {
		mockTransfer = { status: transferStates.ERROR };
		mockAdminUrl = null;

		render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( screen.getByRole( 'link', { name: 'Go to your dashboard' } ) ).toHaveAttribute(
			'href',
			'/home/example.wordpress.com'
		);
	} );

	test( 'requests the latest transfer for its site', () => {
		render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( mockDispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( 123 ) );
	} );

	test( 'does not request a transfer until it has a site id', () => {
		render( <TransferPending siteId={ 0 } orderId={ 456 } /> );

		expect( mockDispatch ).not.toHaveBeenCalledWith( fetchAtomicTransfer( 0 ) );
	} );

	test( 'does not redirect on a stale client_timeout when the site id arrives late', () => {
		const { rerender } = render( <TransferPending siteId={ 0 } orderId={ 456 } /> );

		mockTransfer = { status: transferStates.CLIENT_TIMEOUT };
		rerender( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( mockPage ).not.toHaveBeenCalled();
		expect( mockDispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( 123 ) );
	} );

	test( 'keeps waiting when a client_timeout is already in the store at mount', () => {
		mockTransfer = { status: transferStates.CLIENT_TIMEOUT };

		render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( mockPage ).not.toHaveBeenCalled();
		expect( screen.queryByRole( 'link', { name: 'Go to your dashboard' } ) ).toBeNull();
	} );

	test( 'shows a timeout message on this screen when the store transitions to client_timeout after mount', () => {
		mockTransfer = { status: transferStates.ACTIVE };

		const { rerender } = render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		mockTransfer = { status: transferStates.CLIENT_TIMEOUT };
		rerender( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect(
			screen.getByText(
				'Your transfer is taking longer than expected. It may still finish — reload the page to check.'
			)
		).toBeVisible();
		expect( mockPage ).not.toHaveBeenCalled();
	} );

	test( 'redirects completed transfers to thank you', () => {
		mockTransfer = { status: transferStates.COMPLETED };

		render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( mockPage ).toHaveBeenCalledWith( '/checkout/thank-you/example.wordpress.com/456' );
		expect( mockDispatch ).not.toHaveBeenCalledWith(
			expect.objectContaining( { notice: expect.anything() } )
		);
	} );

	test( 'keeps waiting for an in-progress transfer', () => {
		mockTransfer = { status: transferStates.ACTIVE };

		render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( mockPage ).not.toHaveBeenCalled();
	} );
} );
