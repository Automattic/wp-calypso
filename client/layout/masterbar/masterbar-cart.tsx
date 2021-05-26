/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import page from 'page';
import { useSelector } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import { CheckoutProvider, CheckoutErrorBoundary, Button } from '@automattic/composite-checkout';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Popover from 'calypso/components/popover';
import { WPOrderReviewLineItems } from 'calypso/my-sites/checkout/composite-checkout/components/wp-order-review-line-items';
import { CheckoutSummaryTotal } from 'calypso/my-sites/checkout/composite-checkout/components/wp-checkout-order-summary';

type MasterbarCartProps = { tooltip: string; children: React.ReactNode };

const MasterbarCartOuterWrapper = styled.div`
	display: flex;
`;

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
		<MasterbarCartOuterWrapper className="masterbar__cart" ref={ masterbarButtonRef }>
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
		</MasterbarCartOuterWrapper>
	);
}

function noop() {
	// TODO: get rid of this and provide actual handlers for CheckoutProvider
}

const MasterbarCartCountWrapper = styled.div`
	position: relative;
`;

const MasterbarCartCountContainer = styled.span`
	display: inline-block;
	padding: 1px 6px;
	border: 1px solid var( --color-accent );
	border-radius: 12px;
	font-size: 0.75rem;
	font-weight: 600;
	line-height: 14px;
	text-align: center;
	position: absolute;
	top: 2px;
	right: 2px;
	color: var( --color-text-inverted );
	background-color: var( --color-accent );
`;

const MasterbarCartContentsWrapper = styled.div`
	margin: 10px;
	text-align: left;
	font-size: 16px;
`;

const ButtonSection = styled.div`
	margin-top: 10px;
`;

const MasterbarCartTitle = styled.h2`
	text-align: center;
	border-bottom: 1px solid #ccc;
	padding-bottom: 10px;
`;

function MasterbarCartCount( { productsInCart }: { productsInCart: number } ): JSX.Element {
	return (
		<MasterbarCartCountWrapper>
			<MasterbarCartCountContainer>{ productsInCart }</MasterbarCartCountContainer>
		</MasterbarCartCountWrapper>
	);
}

function MasterbarCartContents( { selectedSiteSlug }: { selectedSiteSlug: string } ) {
	const { removeCoupon } = useShoppingCart();
	const translate = useTranslate();
	const goToCheckout = () => {
		const checkoutUrl = `/checkout/${ selectedSiteSlug }`;
		page( checkoutUrl );
	};
	// TODO: Add trash icon to every item (probably requires https://github.com/Automattic/wp-calypso/pull/52850)
	return (
		<CheckoutProvider
			paymentMethods={ [] }
			paymentProcessors={ {} }
			onPaymentComplete={ noop }
			showErrorMessage={ noop }
			showInfoMessage={ noop }
			showSuccessMessage={ noop }
		>
			<MasterbarCartContentsWrapper>
				<MasterbarCartTitle>{ translate( 'Cart' ) }</MasterbarCartTitle>
				<WPOrderReviewLineItems removeCoupon={ removeCoupon } isCompact />
				<CheckoutSummaryTotal />
				<ButtonSection>
					<Button buttonType={ 'primary' } fullWidth onClick={ goToCheckout }>
						{ translate( 'Checkout' ) }
					</Button>
				</ButtonSection>
			</MasterbarCartContentsWrapper>
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
