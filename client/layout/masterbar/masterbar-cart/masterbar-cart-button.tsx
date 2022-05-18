import { Popover } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { MiniCart } from '@automattic/mini-cart';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MasterbarItem from '../item';
import { CartIcon } from './masterbar-cart-icon';

import './masterbar-cart-button-style.scss';

export type MasterbarCartButtonProps = {
	selectedSiteSlug: string | undefined;
	selectedSiteId: number | undefined;
	goToCheckout: ( siteSlug: string ) => void;
	onRemoveProduct?: ( uuid: string ) => void;
	onRemoveCoupon?: () => void;
};

export function MasterbarCartButton( {
	selectedSiteSlug,
	selectedSiteId,
	goToCheckout,
	onRemoveProduct,
	onRemoveCoupon,
}: MasterbarCartButtonProps ): JSX.Element | null {
	const { responseCart, reloadFromServer } = useShoppingCart(
		selectedSiteId ? selectedSiteId : undefined
	);
	const cartButtonRef = useRef( null );
	const [ isActive, setIsActive ] = useState( false );
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const shouldShowCart = selectedSiteSlug && selectedSiteId && responseCart.products.length > 0;

	useEffect( () => {
		if ( shouldShowCart ) {
			reduxDispatch( recordTracksEvent( 'calypso_masterbar_cart_shown' ) );
		}
	}, [ shouldShowCart, reduxDispatch ] );

	if ( ! shouldShowCart ) {
		return null;
	}

	const onClick = () => {
		setIsActive( ( active ) => {
			if ( ! active ) {
				reloadFromServer(); // Refresh the cart whenever the popup is made visible.
				reduxDispatch( recordTracksEvent( 'calypso_masterbar_cart_open' ) );
			}
			return ! active;
		} );
	};
	const onClose = () => setIsActive( false );
	const tooltip = String( translate( 'My shopping cart' ) );

	return (
		<>
			<MasterbarItem
				className="masterbar-cart-button"
				alwaysShowContent
				icon={ <CartIcon newItems={ !! responseCart.products } active={ isActive } /> }
				tooltip={ tooltip }
				onClick={ onClick }
				isActive={ isActive }
				ref={ cartButtonRef }
			/>
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
					/>
				</CheckoutErrorBoundary>
			</Popover>
		</>
	);
}
