/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import TransferPending from '..';

const mockDispatch = jest.fn();
const mockPage = jest.fn();
let mockTransfer: { status?: string } = {};

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
	} );

	test.each( [ transferStates.ERROR, transferStates.REVERTED ] )(
		'redirects status %s to stats with a failure notice',
		( status ) => {
			mockTransfer = { status };

			render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

			expect( mockDispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						text: "Sorry, we couldn't process your transfer. Please try again later.",
					} ),
				} )
			);
			expect( mockPage ).toHaveBeenCalledWith( '/stats/example.wordpress.com' );
		}
	);

	test( 'redirects timed out transfers to stats with a timeout notice', () => {
		mockTransfer = { status: transferStates.CLIENT_TIMEOUT };

		render( <TransferPending siteId={ 123 } orderId={ 456 } /> );

		expect( mockDispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					text: 'Your transfer is taking longer than expected. It may still finish — reload the page to check.',
				} ),
			} )
		);
		expect( mockPage ).toHaveBeenCalledWith( '/stats/example.wordpress.com' );
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
