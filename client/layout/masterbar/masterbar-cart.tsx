/**
 * External dependencies
 */
import { CheckoutProvider, CheckoutErrorBoundary, Button } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
/**
 * Internal dependencies
 */
import Popover from 'calypso/components/popover';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CartMessages from 'calypso/my-sites/checkout/cart/cart-messages';
import { CheckoutSummaryTotal } from 'calypso/my-sites/checkout/composite-checkout/components/wp-checkout-order-summary';
import { WPOrderReviewLineItems } from 'calypso/my-sites/checkout/composite-checkout/components/wp-order-review-line-items';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import MasterbarItem from './item';

import './masterbar-cart-style.scss';

type MasterbarCartProps = { tooltip: string; children: React.ReactNode };

function MasterbarCart( { children, tooltip }: MasterbarCartProps ): JSX.Element | null {
	const { responseCart, reloadFromServer } = useShoppingCart();
	const selectedSite = useSelector( getSelectedSite );
	const masterbarButtonRef = useRef( null );
	const [ isActive, setIsActive ] = useState( false );

	if ( ! selectedSite?.slug || responseCart.products.length < 1 ) {
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

	return (
		<div className="masterbar-cart__outer-wrapper" ref={ masterbarButtonRef }>
			<CheckoutErrorBoundary errorMessage="Error">
				<MasterbarItem icon="cart" tooltip={ tooltip } onClick={ onClick }>
					{ children }
				</MasterbarItem>
				<MasterbarCartCount productsInCart={ responseCart.products.length } />
				<Popover
					isVisible={ isActive }
					onClose={ onClose }
					context={ masterbarButtonRef.current }
					position="bottom left"
				>
					<MasterbarCartContents selectedSiteSlug={ selectedSite.slug } />
				</Popover>
			</CheckoutErrorBoundary>
		</div>
	);
}

function noop() {} // eslint-disable-line @typescript-eslint/no-empty-function

function MasterbarCartCount( { productsInCart }: { productsInCart: number } ): JSX.Element {
	return (
		<div className="masterbar-cart__count-wrapper">
			<span className="masterbar-cart__count-container">{ productsInCart }</span>
		</div>
	);
}

function MasterbarCartContents( { selectedSiteSlug }: { selectedSiteSlug: string } ) {
	const {
		responseCart,
		removeCoupon,
		removeProductFromCart,
		isLoading,
		isPendingUpdate,
	} = useShoppingCart();
	const translate = useTranslate();
	const goToCheckout = () => {
		const checkoutUrl = `/checkout/${ selectedSiteSlug }`;
		page( checkoutUrl );
	};
	const reduxDispatch = useDispatch();
	const showErrorMessage = useCallback(
		( error ) => {
			const message = error && error.toString ? error.toString() : error;
			reduxDispatch( errorNotice( message ) );
		},
		[ reduxDispatch ]
	);
	const showInfoMessage = useCallback(
		( message ) => {
			reduxDispatch( infoNotice( message ) );
		},
		[ reduxDispatch ]
	);
	const showSuccessMessage = useCallback(
		( message ) => {
			reduxDispatch( successNotice( message ) );
		},
		[ reduxDispatch ]
	);
	const isDisabled = isLoading || isPendingUpdate;

	return (
		<CheckoutProvider
			paymentMethods={ [] }
			paymentProcessors={ {} }
			onPaymentComplete={ noop }
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
		>
			<CartMessages isLoadingCart={ isLoading } cart={ responseCart } />
			<div className="masterbar-cart__content-wrapper">
				<h2 className="masterbar-cart__title">{ translate( 'Cart' ) }</h2>
				<WPOrderReviewLineItems
					removeCoupon={ removeCoupon }
					removeProductFromCart={ removeProductFromCart }
					isCompact
				/>
				<CheckoutSummaryTotal />
				<div className="masterbar-cart__content-footer">
					<Button
						buttonType={ 'primary' }
						fullWidth
						disabled={ isDisabled }
						isBusy={ isDisabled }
						onClick={ goToCheckout }
					>
						{ translate( 'Checkout' ) }
					</Button>
				</div>
			</div>
		</CheckoutProvider>
	);
}

export default function MasterbarCartWrapper( props: MasterbarCartProps ): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MasterbarCart { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
