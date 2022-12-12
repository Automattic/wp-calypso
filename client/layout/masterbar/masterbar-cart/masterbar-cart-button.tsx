import { Popover } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { MiniCart } from '@automattic/mini-cart';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { closeCart, openCart } from 'calypso/state/ui/cart-open/actions';
import isCartOpen from 'calypso/state/ui/selectors/is-cart-open';
import MasterbarItem from '../item';
import { CartIcon } from './masterbar-cart-icon';

import './masterbar-cart-button-style.scss';

export type MasterbarCartButtonProps = {
	selectedSiteSlug: string | undefined;
	selectedSiteId: number | undefined;
	goToCheckout: ( siteSlug: string ) => void;
	onRemoveProduct?: ( uuid: string ) => void;
	onRemoveCoupon?: () => void;
	forceShow?: boolean;
};

export function MasterbarCartButton( {
	selectedSiteSlug,
	selectedSiteId,
	goToCheckout,
	onRemoveProduct,
	onRemoveCoupon,
	forceShow = false,
}: MasterbarCartButtonProps ) {
	const { responseCart, reloadFromServer } = useShoppingCart(
		selectedSiteId ? selectedSiteId : undefined
	);
	const cartButtonRef = useRef( null );
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const shouldShowCart =
		selectedSiteSlug && selectedSiteId && ( responseCart.products.length > 0 || forceShow );

	const shouldOpenCart = useSelector( isCartOpen );
	useEffect( () => {
		if ( shouldShowCart ) {
			reduxDispatch( recordTracksEvent( 'calypso_masterbar_cart_shown' ) );
		} else {
			reduxDispatch( closeCart() );
		}
	}, [ shouldShowCart, reduxDispatch ] );

	if ( ! shouldShowCart ) {
		return null;
	}

	const onClick = () => {
		if ( ! shouldOpenCart ) {
			reloadFromServer(); // Refresh the cart whenever the popup is made visible.
			reduxDispatch( recordTracksEvent( 'calypso_masterbar_cart_open' ) );
			reduxDispatch( openCart() );
			return;
		}

		reduxDispatch( closeCart() );
	};
	const onClose = () => reduxDispatch( closeCart() );
	const tooltip = String( translate( 'My shopping cart' ) );

	return (
		<>
			<MasterbarItem
				className="masterbar-cart-button"
				alwaysShowContent
				icon={ <CartIcon newItems={ !! responseCart.products } active={ shouldOpenCart } /> }
				tooltip={ tooltip }
				onClick={ onClick }
				isActive={ shouldOpenCart }
				ref={ cartButtonRef }
			/>
			<Popover
				isVisible={ shouldOpenCart }
				onClose={ onClose }
				context={ cartButtonRef.current }
				position="bottom left"
				className="masterbar-cart-button__popover"
			>
				<CheckoutErrorBoundary errorMessage="Error">
					<MiniCart
						selectedSiteSlug={ selectedSiteSlug }
						cartKey={ selectedSiteId }
						goToCheckout={ goToCheckout }
						closeCart={ onClose }
						onRemoveProduct={ onRemoveProduct }
						onRemoveCoupon={ onRemoveCoupon }
					/>
				</CheckoutErrorBoundary>
			</Popover>
		</>
	);
}
