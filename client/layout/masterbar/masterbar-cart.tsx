import { Popover } from '@automattic/components';
import { CheckoutProvider, CheckoutErrorBoundary, Button } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import MasterbarItem from './item';
import { MasterbarCartLineItems } from './masterbar-cart-line-items';
import type { ResponseCart } from '@automattic/shopping-cart';

import './masterbar-cart-style.scss';

export type MasterbarCartProps = {
	selectedSiteSlug: string | undefined;
	goToCheckout: ( siteSlug: string ) => void;
};

export function MasterbarCart( {
	selectedSiteSlug,
	goToCheckout,
}: MasterbarCartProps ): JSX.Element | null {
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
		<div className="masterbar-cart" ref={ masterbarButtonRef }>
			<CheckoutErrorBoundary errorMessage="Error">
				<MasterbarItem icon="cart" tooltip={ tooltip } onClick={ onClick } />
				<MasterbarCartCount productsInCart={ responseCart.products.length } />
				<Popover
					isVisible={ isActive }
					onClose={ onClose }
					context={ masterbarButtonRef.current }
					position="bottom left"
				>
					<MasterbarCartContents
						selectedSiteSlug={ selectedSiteSlug }
						goToCheckout={ goToCheckout }
					/>
				</Popover>
			</CheckoutErrorBoundary>
		</div>
	);
}

function MasterbarCartCount( { productsInCart }: { productsInCart: number } ): JSX.Element {
	return (
		<div className="masterbar-cart__count-wrapper">
			<span className="masterbar-cart__count-container">{ productsInCart }</span>
		</div>
	);
}

function MasterbarCartTotal( { responseCart }: { responseCart: ResponseCart } ) {
	const translate = useTranslate();
	return (
		<div className="masterbar-cart__total">
			<span>{ translate( 'Total' ) }</span>
			<span>{ responseCart.total_cost_display }</span>
		</div>
	);
}

function MasterbarCartContents( {
	selectedSiteSlug,
	goToCheckout,
}: {
	selectedSiteSlug: string;
	goToCheckout: ( siteSlug: string ) => void;
} ) {
	const {
		responseCart,
		removeCoupon,
		removeProductFromCart,
		isLoading,
		isPendingUpdate,
	} = useShoppingCart( selectedSiteSlug );
	const translate = useTranslate();
	const isDisabled = isLoading || isPendingUpdate;
	const isPwpoUser = false; // TODO: deal with this properly

	return (
		<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
			<div className="masterbar-cart__content-wrapper">
				<div className="masterbar-cart__content-header">
					<h2 className="masterbar-cart__title">{ translate( 'Cart' ) }</h2>
					<span className="masterbar-cart__site-title">
						{ translate( 'Site: %s', {
							args: selectedSiteSlug,
						} ) }
					</span>
				</div>
				<MasterbarCartLineItems
					removeCoupon={ removeCoupon }
					removeProductFromCart={ removeProductFromCart }
					responseCart={ responseCart }
					isPwpoUser={ isPwpoUser }
				/>
				<MasterbarCartTotal responseCart={ responseCart } />
				<div className="masterbar-cart__content-footer">
					<Button
						className="masterbar-cart__checkout"
						buttonType={ 'primary' }
						fullWidth
						disabled={ isDisabled }
						isBusy={ isDisabled }
						onClick={ () => goToCheckout( selectedSiteSlug ) }
					>
						{ translate( 'Checkout' ) }
					</Button>
				</div>
			</div>
		</CheckoutProvider>
	);
}
