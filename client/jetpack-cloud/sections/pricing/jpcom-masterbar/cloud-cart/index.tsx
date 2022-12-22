import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import MasterbarCartWrapper from 'calypso/layout/masterbar/masterbar-cart/masterbar-cart-wrapper';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useShoppingCartTracker } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-shopping-cart-tracker';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CloudCartIcon from './cloud-cart-icon';
import EmptyCart from './empty-cart';

const CloudCart = () => {
	const translate = useTranslate();
	const shoppingCartTracker = useShoppingCartTracker();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const onRemoveProductFromCart = ( productSlug: string ) => {
		shoppingCartTracker( 'calypso_jetpack_shopping_cart_remove_product', {
			productSlug,
		} );
	};

	const goToCheckout = ( siteSlug: string ) => {
		shoppingCartTracker( 'calypso_jetpack_shopping_cart_checkout_from_cart', {
			addProducts: true,
		} );

		window.location.href = buildCheckoutURL( siteSlug, '' );
	};

	return (
		<div className="header__jetpack-masterbar-cart">
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
