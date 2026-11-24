/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import jetpackCheckout from 'calypso/state/jetpack-checkout/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LicensingActivationThankYou from '../licensing-thank-you-auto-activation';

const receiptId = 1;
const jetpackTemporarySiteId = 2;

describe( 'LicensingActivationThankYou', () => {
	it.each( [
		[
			'Jetpack Search on this site has higher limits.',
			'Jetpack Search on this site has higher limits.',
		],
		[ undefined, 'There was a problem activating Jetpack Complete' ],
	] )( 'explains a refused activation with reason %p', ( reason, expected ) => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( [ 'products', 'jetpack' ], {
			jetpack_complete: { product_id: 3, product_name: 'Jetpack Complete' },
		} );

		renderWithProvider(
			<LicensingActivationThankYou
				productSlug="jetpack_complete"
				receiptId={ receiptId }
				jetpackTemporarySiteId={ jetpackTemporarySiteId }
			/>,
			{
				queryClient,
				reducers: { jetpackCheckout },
				initialState: {
					jetpackCheckout: {
						requestStatus: { [ receiptId ]: 'success' },
						submittedSiteUrl: {
							[ jetpackTemporarySiteId ]: {
								transferred_to: 0,
								incompatible_product_ids: [],
								reason,
							},
						},
					},
				},
			}
		);

		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( expected );
	} );
} );
