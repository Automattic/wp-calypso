/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import jetpackCheckout from 'calypso/state/jetpack-checkout/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LicensingPendingAsyncActivation from '../licensing-pending-async-activation';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

const receiptId = 1;
const jetpackTemporarySiteId = 2;

describe( 'LicensingPendingAsyncActivation', () => {
	it( 'passes the temporary site ID on when a refused activation redirects to the auto-activation page', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( [ 'products', 'jetpack' ], {
			jetpack_pro: { product_id: 3, product_name: 'Jetpack Pro' },
		} );

		renderWithProvider(
			<LicensingPendingAsyncActivation
				productSlug="jetpack_pro"
				receiptId={ receiptId }
				jetpackTemporarySiteId={ jetpackTemporarySiteId }
				fromSiteSlug="example.com"
			/>,
			{
				queryClient,
				reducers: { jetpackCheckout },
				initialState: {
					jetpackCheckout: {
						requestStatus: { [ receiptId ]: 'success' },
						submittedSiteUrl: {
							[ jetpackTemporarySiteId ]: { transferred_to: 0, incompatible_product_ids: [] },
						},
					},
				},
			}
		);

		expect( page ).toHaveBeenCalledTimes( 1 );
		const url = new URL(
			( page as unknown as jest.Mock ).mock.calls[ 0 ][ 0 ],
			'https://example.com'
		);
		expect( url.pathname ).toBe(
			'/checkout/jetpack/thank-you/licensing-auto-activate/jetpack_pro'
		);
		// `licensingThankYouAutoActivation` in `controller.jsx` reads the ID from `siteId`.
		expect( url.searchParams.get( 'siteId' ) ).toBe( String( jetpackTemporarySiteId ) );
	} );
} );
