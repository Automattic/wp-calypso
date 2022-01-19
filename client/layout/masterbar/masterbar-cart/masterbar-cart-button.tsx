import { Popover } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { MiniCart } from '@automattic/mini-cart';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MasterbarItem from '../item';

import './masterbar-cart-button-style.scss';

export type MasterbarCartButtonProps = {
	selectedSiteSlug: string | undefined;
	selectedSiteId: string | number | undefined;
	goToCheckout: ( siteSlug: string ) => void;
};

export function MasterbarCartButton( {
	selectedSiteSlug,
	selectedSiteId,
	goToCheckout,
}: MasterbarCartButtonProps ): JSX.Element | null {
	const { responseCart, reloadFromServer } = useShoppingCart(
		selectedSiteId ? String( selectedSiteId ) : undefined
	);
	const cartButtonRef = useRef( null );
	const [ isActive, setIsActive ] = useState( false );
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	if ( ! selectedSiteSlug || ! selectedSiteId || responseCart.products.length < 1 ) {
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
				icon="cart"
				tooltip={ tooltip }
				onClick={ onClick }
				ref={ cartButtonRef }
			>
				<MasterbarCartCount productsInCart={ responseCart.products.length } />
			</MasterbarItem>
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
					/>
				</CheckoutErrorBoundary>
			</Popover>
		</>
	);
}

function MasterbarCartCount( { productsInCart }: { productsInCart: number } ): JSX.Element {
	return <span className="masterbar-cart-button__count-container">{ productsInCart }</span>;
}
