import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import {
	PaymentLogo,
	getCreditsLineItemFromCart,
	getItemIntroductoryOfferDisplay,
	LineItemSublabelAndPrice,
	LineItemType,
} from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback } from 'react';
import CheckoutTerms from 'calypso/my-sites/checkout/src/components/checkout-terms';
import { CheckIcon } from '../../src/components/check-icon';
import { BEFORE_SUBMIT } from './constants';
import { formatDate } from './util';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { StoredPaymentMethodCard } from 'calypso/lib/checkout/payment-methods';
import type { MouseEventHandler, ReactNode } from 'react';

function PurchaseModalStep( { children, id }: { children: ReactNode; id: string } ) {
	return (
		<div className="purchase-modal__step">
			<span className="purchase-modal__step-icon">
				<CheckIcon id={ id } />
			</span>
			{ children }
		</div>
	);
}

function LineItemIntroductoryOffer( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const introductoryOffer = getItemIntroductoryOfferDisplay( translate, product );

	if ( ! introductoryOffer ) {
		return null;
	}

	return (
		<span
			className={ classNames( 'purchase-modal__product-offer', {
				'is-not-applicable': ! introductoryOffer.enabled,
				'is-discounted': introductoryOffer.enabled,
			} ) }
		>
			{ introductoryOffer.text }
		</span>
	);
}

function OrderStep( { siteSlug, product }: { siteSlug: string; product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const originalAmountDisplay = formatCurrency(
		product.item_original_subtotal_integer,
		product.currency,
		{ isSmallestUnit: true, stripZeros: true }
	);
	const originalAmountInteger = product.item_original_subtotal_integer;

	const actualAmountDisplay = formatCurrency( product.item_subtotal_integer, product.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	const isDiscounted = Boolean(
		product.item_subtotal_integer < originalAmountInteger && originalAmountDisplay
	);

	return (
		<PurchaseModalStep id={ product.product_slug }>
			<div className="purchase-modal__step-title">{ translate( 'Your order' ) }</div>
			<div className="purchase-modal__step-content">
				<div>{ translate( 'Site: %(siteSlug)s', { args: { siteSlug } } ) }</div>
				<div className="purchase-modal__step-content-row">
					<span className="purchase-modal__product-name">{ product.product_name }</span>
					<span className="purchase-modal__product-cost">
						{ isDiscounted && originalAmountDisplay ? (
							<>
								<s>{ originalAmountDisplay }</s> { actualAmountDisplay }
							</>
						) : (
							actualAmountDisplay
						) }
					</span>
				</div>

				<div className="purchase-modal__step-content-row">
					<LineItemSublabelAndPrice product={ product } />
					<LineItemIntroductoryOffer product={ product } />
				</div>
			</div>
		</PurchaseModalStep>
	);
}

function PaymentMethodStep( {
	card,
	siteSlug,
}: {
	card: StoredPaymentMethodCard;
	siteSlug: string;
} ) {
	const translate = useTranslate();
	const clickHandler = useCallback( ( event: React.MouseEvent ) => {
		event.preventDefault();
		page( ( event.target as HTMLAnchorElement ).href );
	}, [] );
	// translators: %s will be replaced with the last 4 digits of a credit card.
	const maskedCard = sprintf( translate( '**** %s' ), card?.card_last_4 || '' );

	return (
		<PurchaseModalStep id="payment-method">
			<div className="purchase-modal__step-title">
				{ translate( 'Payment method' ) }
				<a href={ `/checkout/${ siteSlug }` } onClick={ clickHandler }>
					{ translate( 'Edit' ) }
				</a>
			</div>
			<div className="purchase-modal__step-content">
				<div className="purchase-modal__card-holder">{ card.name }</div>
				<div>
					<PaymentLogo brand={ card.card_type } isSummary={ true } />
					<span className="purchase-modal__card-number">{ maskedCard }</span>
					<span className="purchase-modal__card-expiry">{ `${ translate(
						'Expiry:'
					) } ${ formatDate( card.expiry ) }` }</span>
				</div>
			</div>
		</PurchaseModalStep>
	);
}

function OrderReview( {
	creditsLineItem,
	shouldDisplayTax,
	tax,
	total,
}: {
	creditsLineItem?: LineItemType | null;
	shouldDisplayTax: boolean;
	tax: string;
	total: string;
} ) {
	const translate = useTranslate();

	return (
		<dl className="purchase-modal__review">
			{ creditsLineItem && <dt className="purchase-modal__credits">{ creditsLineItem.label }</dt> }
			{ creditsLineItem && (
				<dd className="purchase-modal__credits">{ creditsLineItem.formattedAmount }</dd>
			) }

			{ shouldDisplayTax && <dt className="purchase-modal__tax">{ translate( 'Taxes' ) }</dt> }
			{ shouldDisplayTax && <dd className="purchase-modal__tax">{ tax }</dd> }

			<dt>{ translate( 'Total' ) }</dt>
			<dd>{ total }</dd>
		</dl>
	);
}

function PayButton( {
	busy,
	onClick,
	totalCost,
	totalCostDisplay = '',
}: {
	busy?: boolean;
	onClick: MouseEventHandler< HTMLButtonElement >;
	totalCost: number;
	totalCostDisplay: string;
} ) {
	const translate = useTranslate();
	// translators: %s is the total to be paid in localized currency
	const payText =
		totalCost === 0
			? translate( 'Complete Checkout' )
			: sprintf( translate( 'Pay %s' ), totalCostDisplay );
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
}: {
	cards: StoredPaymentMethodCard[];
	cart: ResponseCart;
	onClose(): void;
	siteSlug: string;
	step: string;
	submitTransaction(): void;
} ) {
	const translate = useTranslate();
	const creditsLineItem = getCreditsLineItemFromCart( cart );
	const firstProduct = cart.products.length > 0 ? cart.products[ 0 ] : undefined;
	const firstCard = cards.length > 0 ? cards[ 0 ] : undefined;

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
			{ firstProduct && <OrderStep siteSlug={ siteSlug } product={ firstProduct } /> }
			{ firstCard && <PaymentMethodStep siteSlug={ siteSlug } card={ firstCard } /> }
			<CheckoutTerms cart={ cart } />
			<hr />
			<OrderReview
				creditsLineItem={ cart.sub_total_integer > 0 ? creditsLineItem : null }
				shouldDisplayTax={ cart.tax.display_taxes }
				total={ formatCurrency( cart.total_cost_integer, cart.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
				tax={ formatCurrency( cart.total_tax_integer, cart.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			/>
			<PayButton
				busy={ BEFORE_SUBMIT !== step }
				onClick={ submitTransaction }
				totalCost={ cart.total_cost_integer }
				totalCostDisplay={ formatCurrency( cart.total_cost_integer, cart.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			/>
		</>
	);
}
