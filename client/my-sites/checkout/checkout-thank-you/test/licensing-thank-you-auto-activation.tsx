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
			'jetpack_pro_lower_limits',
			'This site has a Jetpack product with higher limits than Jetpack Pro',
		],
		[
			'jetpack_pro_other_owner',
			'A Jetpack product on this site belongs to another WordPress.com account',
		],
		[ 'product_incompatibility', 'There was a problem activating Jetpack Pro' ],
		[ undefined, 'There was a problem activating Jetpack Pro' ],
	] )( 'explains a refused activation with reason code %p', ( reasonCode, expected ) => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( [ 'products', 'jetpack' ], {
			jetpack_pro: { product_id: 3, product_name: 'Jetpack Pro' },
		} );

		renderWithProvider(
			<LicensingActivationThankYou
				productSlug="jetpack_pro"
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
								reason_code: reasonCode,
							},
						},
					},
				},
			}
		);

		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( expected );
	} );
} );
