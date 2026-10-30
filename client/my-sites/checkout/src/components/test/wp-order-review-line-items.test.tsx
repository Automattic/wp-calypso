/**
 * @jest-environment jsdom
 */
import { CheckoutProvider } from '@automattic/composite-checkout';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { RestorableProductsProvider } from '@automattic/wpcom-checkout';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { WPOrderReviewLineItems } from '../wp-order-review-line-items';
import type { OnChangeItemVariant } from '../item-variation-picker';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

jest.mock( 'calypso/my-sites/checkout/src/hooks/product-variants', () => ( {
	useGetProductVariants: () => [
		{ productSlug: 'jetpack_backup_t1_yearly', productId: 2100, termIntervalInMonths: 12 },
		{ productSlug: 'jetpack_backup_t1_monthly', productId: 2101, termIntervalInMonths: 1 },
	],
} ) );
jest.mock( '../item-variation-picker', () => ( {
	ItemVariationPicker: ( {
		id,
		onChangeItemVariant,
	}: {
		id: string;
		onChangeItemVariant: OnChangeItemVariant;
	} ) => (
		<button
			onClick={ () => onChangeItemVariant( id, 'jetpack_backup_t1_monthly', 2101, undefined ) }
		>
			Switch to monthly
		</button>
	),
} ) );
jest.mock( '../../hooks/use-mobile-checkout-sticky-summary-experiment', () => ( {
	useMobileCheckoutStickySummaryExperiment: () => ( { isMobileCheckoutStickySummary: false } ),
} ) );
jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-renewal-price-experiment', () => ( {
	useRenewalPricingExperiment: () => [ false, 'control' ],
	isRenewalPricingTreatment: () => false,
} ) );

function buildLicense( uuid: string, cartItemIndex: number ): ResponseCartProduct {
	return {
		...getEmptyResponseCartProduct(),
		uuid,
		product_slug: 'jetpack_backup_t1_yearly',
		product_id: 2100,
		product_name: 'Jetpack VaultPress Backup',
		extra: { mergeIdenticalItems: true, cart_item_index: cartItemIndex },
	};
}

describe( 'WPOrderReviewLineItems', () => {
	it( 'changes the term of every license merged into one line', async () => {
		const onChangeSelection = jest.fn();
		const responseCart = {
			...getEmptyResponseCart(),
			products: [ buildLicense( 'a', 0 ), buildLicense( 'b', 1 ), buildLicense( 'c', 2 ) ],
		};

		renderWithProvider(
			<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
				<RestorableProductsProvider>
					<WPOrderReviewLineItems
						responseCart={ responseCart }
						removeProductFromCart={ jest.fn() }
						replaceProductInCart={ jest.fn() }
						addProductsToCart={ jest.fn() }
						removeCoupon={ jest.fn() }
						onChangeSelection={ onChangeSelection }
						isPwpoUser={ false }
					/>
				</RestorableProductsProvider>
			</CheckoutProvider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Switch to monthly' } ) );

		expect( onChangeSelection.mock.calls ).toEqual(
			[ 'a', 'b', 'c' ].map( ( uuid ) => [ uuid, 'jetpack_backup_t1_monthly', 2101, undefined ] )
		);
	} );
} );
