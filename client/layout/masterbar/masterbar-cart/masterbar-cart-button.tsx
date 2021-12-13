import { Popover } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { MiniCart } from '@automattic/mini-cart';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import MasterbarItem from '../item';

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
	const cartButtonRef = useRef( null );
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
	const tooltip = translate( 'My shopping cart' );

	return (
		<>
			<MasterbarItem
				className="masterbar-cart-button"
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
			>
				<CheckoutErrorBoundary errorMessage="Error">
					<MiniCart selectedSiteSlug={ selectedSiteSlug } goToCheckout={ goToCheckout } />
				</CheckoutErrorBoundary>
			</Popover>
		</>
	);
}

function MasterbarCartCount( { productsInCart }: { productsInCart: number } ): JSX.Element {
	return <span className="masterbar-cart-button__count-container">{ productsInCart }</span>;
}
