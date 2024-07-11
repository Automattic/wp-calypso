import { Popover } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { MiniCart } from '@automattic/mini-cart';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MasterbarItem from '../item';
import { MasterBarCartCount } from './masterbar-cart-count';
import { CartIcon } from './masterbar-cart-icon';

import './masterbar-cart-button-style.scss';

export type MasterbarCartButtonProps = {
	selectedSiteSlug: string | undefined;
	selectedSiteId: number | undefined;
	goToCheckout: ( siteSlug: string ) => void;
	onRemoveProduct?: ( uuid: string ) => void;
	onRemoveCoupon?: () => void;
	forceShow?: boolean;
	showCount?: boolean;
	checkoutLabel?: string;
	cartIcon?: React.ReactNode;
	emptyCart?: React.ReactNode;
	onLoad?: () => void;
};

export function MasterbarCartButton( {
	selectedSiteSlug,
	selectedSiteId,
	goToCheckout,
	onRemoveProduct,
	onRemoveCoupon,
	forceShow = false,
	showCount = false,
	checkoutLabel,
	cartIcon,
	emptyCart,
	onLoad = () => {},
}: MasterbarCartButtonProps ) {
	const { responseCart, reloadFromServer } = useShoppingCart(
		selectedSiteId ? selectedSiteId : undefined
	);
	const cartButtonRef = useRef( null );
	const [ isActive, setIsActive ] = useState( false );
	const translate = useTranslate();

	const reduxDispatch = useDispatch();
	const shouldShowCart =
		selectedSiteSlug && selectedSiteId && ( responseCart.products.length > 0 || forceShow );

	useEffect( () => {
		if ( shouldShowCart ) {
			reduxDispatch( recordTracksEvent( 'calypso_masterbar_cart_shown' ) );
			onLoad();
		} else {
			setIsActive( false );
		}
	}, [ shouldShowCart, reduxDispatch, onLoad ] );

	useEffect( () => {
		if ( isActive ) {
			document.body.classList.add( 'body--masterbar-cart-visible' );
		} else {
			document.body.classList.remove( 'body--masterbar-cart-visible' );
		}
	}, [ isActive ] );

	if ( ! shouldShowCart ) {
		return null;
	}

	const onClick = () => {
		setIsActive( ( active ) => {
			if ( ! active ) {
				// This is to prevent an error in updating the component in the same event loop
				setTimeout(
					() =>
						reloadFromServer().catch( () => {
							// No need to do anything here. CartMessages will report this error to the user.
						} ),
					0
				); // Refresh the cart whenever the popup is made visible.
				reduxDispatch( recordTracksEvent( 'calypso_masterbar_cart_open' ) );
			}
			return ! active;
		} );
	};
	const onClose = () => setIsActive( false );
	const tooltip = String( translate( 'My shopping cart' ) );

	const cartCount = responseCart?.products?.length;
	const icon = cartIcon || <CartIcon newItems={ !! responseCart.products } active={ isActive } />;

	return (
		<>
			<MasterbarItem
				className="masterbar-cart-button"
				alwaysShowContent
				icon={ icon }
				tooltip={ tooltip }
				onClick={ onClick }
				isActive={ isActive }
				ref={ cartButtonRef }
			/>
			{ showCount && <MasterBarCartCount cartCount={ cartCount } /> }
			<Popover
				isVisible={ isActive }
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
						checkoutLabel={ checkoutLabel }
						emptyCart={ emptyCart }
					/>
				</CheckoutErrorBoundary>
			</Popover>
		</>
	);
}
