import { Button, Gridicon } from '@automattic/components';
import { CheckoutCheckIcon, PaymentLogo } from '@automattic/composite-checkout';
import {
	getCreditsLineItemFromCart,
	getIntroductoryOfferIntervalDisplay,
	getSublabelAndPrice,
} from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback } from 'react';
import CheckoutTerms from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms';
import { BEFORE_SUBMIT } from './constants';
import { formatDate } from './util';
import type { LineItem } from '@automattic/composite-checkout';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';
import type { MouseEventHandler, ReactNode } from 'react';

function PurchaseModalStep( { children, id }: { children: ReactNode; id: string } ) {
	return (
		<div className="purchase-modal__step">
			<span className="purchase-modal__step-icon">
				<CheckoutCheckIcon id={ id } />
			</span>
			{ children }
		</div>
	);
}

function LineItemSublabelAndPrice( { product }: { product: ResponseCartProduct } ) {
	const sublabelAndPrice = getSublabelAndPrice( product );

	return <>{ sublabelAndPrice }</>;
}

function IntroductoryOfferCallout( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();

	if ( product.introductory_offer_terms?.reason ) {
		return (
			<span className="purchase-modal__product-offer is-not-applicable">
				{ translate( 'Order not eligible for introductory discount' ) }
			</span>
		);
	}

	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}

	const isFreeTrial = product.item_subtotal_integer === 0;
	const text = getIntroductoryOfferIntervalDisplay(
		translate,
		product.introductory_offer_terms.interval_unit,
		product.introductory_offer_terms.interval_count,
		isFreeTrial,
		'checkout',
		product.introductory_offer_terms.transition_after_renewal_count
	);

	return <span className="purchase-modal__product-offer is-discounted">{ text }</span>;
}

function OrderStep( { siteSlug, product }: { siteSlug: string; product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const originalAmountDisplay = product.item_original_subtotal_display;
	const originalAmountInteger = product.item_original_subtotal_integer;

	const actualAmountDisplay = product.item_subtotal_display;
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
					<IntroductoryOfferCallout product={ product } />
				</div>
			</div>
		</PurchaseModalStep>
	);
}

function PaymentMethodStep( { card, siteSlug }: { card: StoredCard; siteSlug: string } ) {
	const translate = useTranslate();
	const clickHandler = useCallback( ( event ) => {
		event.preventDefault();
		page( event.target.href );
	}, [] );
	// translators: %s will be replaced with the last 4 digits of a credit card.
	const maskedCard = sprintf( translate( '**** %s' ), card?.card || '' );

	return (
		<PurchaseModalStep id="payment-method">
			<div className="purchase-modal__step-title">
				{ translate( 'Payment method' ) }
				<a href={ `/checkout/${ siteSlug }` } onClick={ clickHandler }>
					{ translate( 'Edit' ) }
				</a>
			</div>
			<div className="purchase-modal__step-content">
				<div className="purchase-modal__card-holder">{ card?.name }</div>
				<div>
					<PaymentLogo brand={ card?.card_type } isSummary={ true } />
					<span className="purchase-modal__card-number">{ maskedCard }</span>
					<span className="purchase-modal__card-expiry">{ `${ translate(
						'Expiry:'
					) } ${ formatDate( card?.expiry ) }` }</span>
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
	creditsLineItem?: LineItem | null;
	shouldDisplayTax: boolean;
	tax: string;
	total: string;
} ) {
	const translate = useTranslate();

	return (
		<dl className="purchase-modal__review">
			{ creditsLineItem && <dt className="purchase-modal__credits">{ creditsLineItem.label }</dt> }
			{ creditsLineItem && (
				<dd className="purchase-modal__credits">{ creditsLineItem.amount.displayValue }</dd>
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
	cards: StoredCard[];
	cart: ResponseCart;
	onClose(): void;
	siteSlug: string;
	step: string;
	submitTransaction(): void;
} ) {
	const translate = useTranslate();
	const creditsLineItem = getCreditsLineItemFromCart( cart );

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
				creditsLineItem={ cart.sub_total_integer > 0 ? creditsLineItem : null }
				shouldDisplayTax={ cart.tax?.display_taxes }
				total={ cart.total_cost_display }
				tax={ cart.total_tax_display }
			/>
			<PayButton
				busy={ BEFORE_SUBMIT !== step }
				onClick={ submitTransaction }
				totalCost={ cart.total_cost_integer }
				totalCostDisplay={ cart.total_cost_display }
			/>
		</>
	);
}
