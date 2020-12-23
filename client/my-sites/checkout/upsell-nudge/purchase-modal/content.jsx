/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { Button } from '@automattic/components';
import { CheckoutCheckIcon, PaymentLogo } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import CheckoutTerms from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms';
import { formatDate } from './util';
import { BEFORE_SUBMIT } from './constants';

function PurchaseModalStep( { children } ) {
	return (
		<div className="purchase-modal__step">
			<span className="purchase-modal__step-icon">
				<CheckoutCheckIcon />
			</span>
			{ children }
		</div>
	);
}

function OrderStep( { siteSlug, product } ) {
	const translate = useTranslate();
	return (
		<PurchaseModalStep>
			<div className="purchase-modal__step-title">{ translate( 'Your order' ) }</div>
			<div className="purchase-modal__step-content">
				<div>{ translate( 'Site: %(siteSlug)s', { args: { siteSlug } } ) }</div>
				<div className="purchase-modal__product">
					<span className="purchase-modal__product-name">{ product?.product_name }</span>
					<span className="purchase-modal__cost">{ product?.product_cost_display }</span>
				</div>
			</div>
		</PurchaseModalStep>
	);
}

function PaymentMethodStep( { siteSlug, card } ) {
	const translate = useTranslate();
	const clickHandler = useCallback( ( event ) => {
		event.preventDefault();
		page( event.target.href );
	}, [] );
	// translators: %s will be replaced with the last 4 digits of a credit card.
	const maskedCard = sprintf( translate( '**** %s' ), card?.card || '' );

	return (
		<PurchaseModalStep>
			<div className="purchase-modal__step-title">
				{ translate( 'Payment method' ) }
				<a href={ `/checkout/${ siteSlug }` } onClick={ clickHandler }>
					{ translate( 'Edit' ) }
				</a>
			</div>
			<div className="purchase-modal__step-content">
				<div className="purchase-modal__card-holder">{ card?.name }</div>
				<div>
					<PaymentLogo brand={ card?.card_type } isSummary />
					<span className="purchase-modal__card-number">{ maskedCard }</span>
					<span className="purchase-modal__card-expiry">{ `${ translate(
						'Expiry:'
					) } ${ formatDate( card?.expiry ) }` }</span>
				</div>
			</div>
		</PurchaseModalStep>
	);
}

function OrderReview( { shouldDisplayTax, tax, total } ) {
	const translate = useTranslate();
	return (
		<dl className="purchase-modal__review">
			{ shouldDisplayTax && <dt className="purchase-modal__tax">{ translate( 'Taxes' ) }</dt> }
			{ shouldDisplayTax && <dd className="purchase-modal__tax">{ tax }</dd> }
			<dt>{ translate( 'Total' ) }</dt>
			<dd>{ total }</dd>
		</dl>
	);
}

function PayButton( { busy, totalCost, onClick } ) {
	const translate = useTranslate();
	// translators: The payText will be like "Pay $205.99".
	const payText = sprintf( translate( 'Pay %s' ), totalCost || '…' );
	const processingText = translate( 'Processing…' );

	return (
		<Button
			primary={ ! busy }
			busy={ busy }
			disabled={ busy }
			onClick={ onClick }
			className="purchase-modal__pay-button"
		>
			{ busy ? processingText : payText }
		</Button>
	);
}

export default function PurchaseModalContent( {
	cards,
	cart,
	onClose,
	siteSlug,
	step,
	submitTransaction,
} ) {
	const translate = useTranslate();

	return (
		<>
			<Button
				borderless
				className="purchase-modal__close"
				aria-label={ translate( 'Close dialog' ) }
				onClick={ onClose }
			>
				<Gridicon icon="cross-small" />
			</Button>
			<OrderStep siteSlug={ siteSlug } product={ cart.products?.[ 0 ] } />
			<PaymentMethodStep siteSlug={ siteSlug } card={ cards?.[ 0 ] } />
			<CheckoutTerms cart={ cart } />
			<hr />
			<OrderReview
				total={ cart.total_cost_display }
				tax={ cart.total_tax_display }
				shouldDisplayTax={ cart.tax?.display_taxes }
			/>
			<PayButton
				busy={ BEFORE_SUBMIT !== step }
				totalCost={ cart.total_cost_display }
				onClick={ submitTransaction }
			/>
		</>
	);
}
