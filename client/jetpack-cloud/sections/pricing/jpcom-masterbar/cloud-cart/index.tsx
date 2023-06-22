import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import MasterbarCartWrapper from 'calypso/layout/masterbar/masterbar-cart/masterbar-cart-wrapper';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useShoppingCartTracker } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-shopping-cart-tracker';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CloudCartIcon from './cloud-cart-icon';
import EmptyCart from './empty-cart';

const CloudCart = ( { cartStyle }: { cartStyle?: React.CSSProperties } ) => {
	const translate = useTranslate();
	const shoppingCartTracker = useShoppingCartTracker();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const { responseCart } = useShoppingCart( siteId ?? undefined );

	const onRemoveProductFromCart = ( productSlug: string ) => {
		shoppingCartTracker( 'calypso_jetpack_shopping_cart_remove_product', {
			productSlug,
		} );
	};

	const goToCheckout = ( siteSlug: string ) => {
		shoppingCartTracker( 'calypso_jetpack_shopping_cart_checkout_from_cart', {
			addProducts: true,
		} );
		const buildUrlParams =
			responseCart.products.length > 1
				? {
						redirect_to: `https://${ siteSlug }/wp-admin/admin.php?page=jetpack#/recommendations/site-type`,
				  }
				: undefined;

		window.location.href = buildCheckoutURL( siteSlug, '', buildUrlParams );
	};

	return (
		<div className="header__jetpack-masterbar-cart" style={ cartStyle }>
			<MasterbarCartWrapper
				goToCheckout={ goToCheckout }
				onRemoveProduct={ onRemoveProductFromCart }
				selectedSiteSlug={ siteSlug || undefined }
				selectedSiteId={ siteId || undefined }
				checkoutLabel={ translate( 'Go to Checkout' ) }
				cartIcon={ <CloudCartIcon /> }
				emptyCart={ <EmptyCart /> }
				forceShow
				showCount
			/>
		</div>
	);
};

export default CloudCart;
