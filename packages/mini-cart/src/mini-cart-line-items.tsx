import {
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	groupBundleLineItems,
	BundleLineItem,
	NonProductLineItem,
	LineItem,
	canItemBeRemovedFromCart,
	useRestorableProducts,
	RemovedFromCartItem,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import type { Theme } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	RemoveCouponFromCart,
	AddProductsToCart,
} from '@automattic/shopping-cart';

const MiniCartLineItemsWrapper = styled.ul< { theme?: Theme } >`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
	overflow-y: auto;
	max-height: 50vh;
	scrollbar-color: var( --color-text, #000 ) var( --color-surface, #fff );
`;

const MiniCartLineItemWrapper = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

export function MiniCartLineItems( {
	removeProductFromCart,
	addProductsToCart,
	removeCoupon,
	createUserAndSiteBeforeTransaction,
	responseCart,
	showBundleGrouping = false,
}: {
	removeProductFromCart: RemoveProductFromCart;
	addProductsToCart: AddProductsToCart;
	removeCoupon: RemoveCouponFromCart;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	showBundleGrouping?: boolean;
} ) {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();

	// Bundle grouping is gated behind the `domain-bundling` feature flag, surfaced
	// here as the `showBundleGrouping` prop (this package stays free of a
	// calypso-config dependency). When off, every product renders on its own line.
	const groupedLineItems = showBundleGrouping
		? groupBundleLineItems( responseCart.products )
		: responseCart.products.map( ( product ) => ( { type: 'product' as const, product } ) );

	return (
		<MiniCartLineItemsWrapper className="mini-cart-line-items">
			{ groupedLineItems.map( ( entry ) => {
				if ( entry.type === 'bundle' ) {
					return (
						<MiniCartLineItemWrapper key={ `bundle-${ entry.groupId }` }>
							<BundleLineItem
								bundle={ entry }
								hasDeleteButton={ entry.products.every( ( product ) =>
									canItemBeRemovedFromCart( product, responseCart )
								) }
								removeProductFromCart={ removeProductFromCart }
							/>
						</MiniCartLineItemWrapper>
					);
				}

				const { product } = entry;
				return (
					<MiniCartLineItemWrapper key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeRemovedFromCart( product, responseCart ) }
							removeProductFromCart={ removeProductFromCart }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
							responseCart={ responseCart }
							isRestorable
							restorableProducts={ restorableProducts }
							setRestorableProducts={ setRestorableProducts }
						/>
					</MiniCartLineItemWrapper>
				);
			} ) }
			{ restorableProducts.map( ( product ) => (
				<RemovedFromCartItem
					key={ product.uuid }
					product={ product }
					addProductsToCart={ addProductsToCart }
				/>
			) ) }
			{ couponLineItem && (
				<MiniCartLineItemWrapper key={ couponLineItem.id }>
					<NonProductLineItem
						lineItem={ couponLineItem }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						hasDeleteButton={ couponLineItem.hasDeleteButton }
					/>
				</MiniCartLineItemWrapper>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem subtotal lineItem={ creditsLineItem } />
			) }
		</MiniCartLineItemsWrapper>
	);
}
