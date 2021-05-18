/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import page from 'page';
import { useSelector } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import { CheckoutProvider, CheckoutErrorBoundary, Button } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Popover from 'calypso/components/popover';
import {
	WPOrderReviewLineItems,
	WPOrderReviewSection,
} from 'calypso/my-sites/checkout/composite-checkout/components/wp-order-review-line-items';

type MasterbarCartProps = { tooltip: string; children: React.ReactNode };

function MasterbarCart( { children, tooltip }: MasterbarCartProps ): JSX.Element | null {
	const { responseCart } = useShoppingCart();
	const selectedSite = useSelector( getSelectedSite );
	const ref = useRef( null );
	const [ isActive, setIsActive ] = useState( false );

	if ( ! selectedSite?.slug || responseCart.products.length < 1 ) {
		return null;
	}

	const onClick = () => setIsActive( ( active ) => ! active );
	const onClose = () => setIsActive( false );

	return (
		<div className="masterbar__cart" ref={ ref }>
			<CheckoutErrorBoundary errorMessage="Error">
				<MasterbarItem icon="cart" tooltip={ tooltip } onClick={ onClick }>
					{ children }
				</MasterbarItem>
				<Popover isVisible={ isActive } onClose={ onClose } context={ ref.current }>
					<MasterbarCartContents selectedSiteSlug={ selectedSite.slug } />
				</Popover>
			</CheckoutErrorBoundary>
		</div>
	);
}

function noop() {
	// TODO
}

function MasterbarCartContents( { selectedSiteSlug }: { selectedSiteSlug: string } ) {
	const { removeCoupon } = useShoppingCart();
	const translate = useTranslate();
	const goToCheckout = () => {
		const checkoutUrl = `/checkout/${ selectedSiteSlug }`;
		page( checkoutUrl );
	};
	return (
		<CheckoutProvider
			paymentMethods={ [] }
			paymentProcessors={ {} }
			onPaymentComplete={ noop }
			showErrorMessage={ noop }
			showInfoMessage={ noop }
			showSuccessMessage={ noop }
		>
			<WPOrderReviewSection>
				<WPOrderReviewLineItems removeCoupon={ removeCoupon } />
				<Button onClick={ goToCheckout }>{ translate( 'Checkout' ) }</Button>
			</WPOrderReviewSection>
		</CheckoutProvider>
	);
}

export default function MasterBarCartWrapper( props: MasterbarCartProps ): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MasterbarCart { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
