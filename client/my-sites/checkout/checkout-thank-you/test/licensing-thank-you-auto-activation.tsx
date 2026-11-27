/**
 * @vitest-environment jsdom
 */
import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import jetpackCheckout from 'calypso/state/jetpack-checkout/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LicensingActivationThankYou from '../licensing-thank-you-auto-activation';

const receiptId = 1;
const jetpackTemporarySiteId = 2;

describe( 'LicensingActivationThankYou', () => {
	it.each( [
		{
			reasonCode: 'jetpack_pro_lower_limits',
			incompatibleProductIds: [],
			expected: 'This site has a Jetpack product that includes more than Jetpack Pro',
			contactHref: JETPACK_CONTACT_SUPPORT,
		},
		{
			reasonCode: 'jetpack_pro_other_owner',
			incompatibleProductIds: [],
			expected: 'A Jetpack product on this site belongs to another WordPress.com account',
			contactHref: JETPACK_CONTACT_SUPPORT,
		},
		{
			reasonCode: 'jetpack_pro_lower_limits',
			incompatibleProductIds: [ 4 ],
			expected: 'This site has a Jetpack product that includes more than Jetpack Pro',
			contactHref: JETPACK_CONTACT_SUPPORT,
		},
		{
			reasonCode: 'product_incompatibility',
			incompatibleProductIds: [],
			expected: 'There was a problem activating Jetpack Pro',
			contactHref: null,
		},
		{
			reasonCode: undefined,
			incompatibleProductIds: [],
			expected: 'There was a problem activating Jetpack Pro',
			contactHref: null,
		},
	] )(
		'explains a refused activation with reason code $reasonCode and incompatible products $incompatibleProductIds',
		( { reasonCode, incompatibleProductIds, expected, contactHref } ) => {
			const queryClient = new QueryClient();
			queryClient.setQueryData( [ 'products', 'jetpack' ], {
				jetpack_pro: { product_id: 3, product_name: 'Jetpack Pro' },
				jetpack_search: { product_id: 4, product_name: 'Jetpack Search' },
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
									incompatible_product_ids: incompatibleProductIds,
									reason_code: reasonCode,
								},
							},
						},
					},
				}
			);

			const alert = screen.getByRole( 'alert' );
			expect( alert ).toHaveTextContent( expected );
			expect(
				within( alert )
					.queryByRole( 'link', { name: /contact us/i } )
					?.getAttribute( 'href' ) ?? null
			).toBe( contactHref );
		}
	);
} );
