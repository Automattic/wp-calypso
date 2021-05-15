import { Popover } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import MasterbarItem from './item';
import { MasterbarCart } from './masterbar-cart';

import './masterbar-cart-button-style.scss';

export type MasterbarCartButtonProps = {
	selectedSiteSlug: string | undefined;
	goToCheckout: ( siteSlug: string ) => void;
};

export function MasterbarCartButton( {
	selectedSiteSlug,
	goToCheckout,
}: MasterbarCartButtonProps ): JSX.Element | null {
	const { responseCart, reloadFromServer } = useShoppingCart( selectedSiteSlug );
	const masterbarButtonRef = useRef( null );
	const [ isActive, setIsActive ] = useState( false );
	const translate = useTranslate();

	if ( ! selectedSiteSlug || responseCart.products.length < 1 ) {
		return null;
	}

	const onClick = () => {
		setIsActive( ( active ) => {
			if ( ! active ) {
				reloadFromServer();
			}
			return ! active;
		} );
	};
	const onClose = () => setIsActive( false );
	const tooltip = translate( 'View my Shopping Cart' );

	return (
		<div className="masterbar-cart-button" ref={ masterbarButtonRef }>
			<CheckoutErrorBoundary errorMessage="Error">
				<MasterbarItem icon="cart" tooltip={ tooltip } onClick={ onClick } />
				<MasterbarCartCount productsInCart={ responseCart.products.length } />
				<Popover
					isVisible={ isActive }
					onClose={ onClose }
					context={ masterbarButtonRef.current }
					position="bottom left"
				>
					<MasterbarCart selectedSiteSlug={ selectedSiteSlug } goToCheckout={ goToCheckout } />
				</Popover>
			</CheckoutErrorBoundary>
		</div>
	);
}

function MasterbarCartCount( { productsInCart }: { productsInCart: number } ): JSX.Element {
	return (
		<div className="masterbar-cart-button__count-wrapper">
			<span className="masterbar-cart-button__count-container">{ productsInCart }</span>
		</div>
	);
}
