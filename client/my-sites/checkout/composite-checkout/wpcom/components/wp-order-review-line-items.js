/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
	renderDisplayValueMarkdown,
	CheckoutModal,
	useFormStatus,
	useEvents,
	Button,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import { useHasDomainsInCart } from '../hooks/has-domains';
import { ItemVariationPicker } from './item-variation-picker';
import { isBusinessPlan } from 'lib/plans';

export function WPOrderReviewSection( { children, className } ) {
	return <div className={ joinClasses( [ className, 'order-review-section' ] ) }>{ children }</div>;
}

WPOrderReviewSection.propTypes = {
	className: PropTypes.string,
};

function WPLineItem( {
	item,
	className,
	hasDeleteButton,
	removeItem,
	variantSelectOverride,
	getItemVariants,
	onChangePlanLength,
	couponStatus,
	isSummary,
	isWhiteGloveOffer,
} ) {
	const translate = useTranslate();
	const hasDomainsInCart = useHasDomainsInCart();
	const { formStatus } = useFormStatus();
	const itemSpanId = `checkout-line-item-${ item.id }`;
	const deleteButtonId = `checkout-delete-button-${ item.id }`;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const modalCopy = returnModalCopy( item.type, translate, hasDomainsInCart );
	const onEvent = useEvents();
	const isDisabled = formStatus !== 'ready';

	const isRenewal = item.wpcom_meta?.extra?.purchaseId;
	// Show the variation picker when this is not a renewal
	const shouldShowVariantSelector = getItemVariants && item.wpcom_meta && ! isRenewal;
	const isGSuite = !! item.wpcom_meta?.extra?.google_apps_users?.length;
	const isSavings = item.type === 'coupon';

	let gsuiteDiscountCallout = null;
	if (
		isGSuite &&
		item.amount.value < item.wpcom_meta?.item_original_subtotal_integer &&
		couponStatus !== 'applied'
	) {
		gsuiteDiscountCallout = (
			<DiscountCalloutUI>{ translate( 'Discount for first year' ) }</DiscountCalloutUI>
		);
	}

	const productSlug = item.wpcom_meta?.product_slug;
	const isBusinessPlanProduct = productSlug && isBusinessPlan( productSlug );
	const productName =
		isBusinessPlanProduct && isWhiteGloveOffer
			? `${ item.label } (with Expert guidance)`
			: item.label;

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className={ joinClasses( [ className, 'checkout-line-item' ] ) }
			data-e2e-product-slug={ productSlug }
			data-product-type={ item.type }
		>
			<LineItemTitle id={ itemSpanId } isSummary={ isSummary }>
				{ productName }
			</LineItemTitle>
			<span aria-labelledby={ itemSpanId } className="checkout-line-item__price">
				<LineItemPrice item={ item } isSummary={ isSummary } />
			</span>
			{ item.sublabel && (
				<LineItemMeta>
					<LineItemSublabelAndPrice item={ item } />
					{ item.wpcom_meta?.is_bundled && item.amount.value === 0 && (
						<DiscountCalloutUI>{ translate( 'First year free' ) }</DiscountCalloutUI>
					) }
				</LineItemMeta>
			) }
			{ isSavings && <SavingsList item={ item } /> }
			{ isGSuite && (
				<GSuiteUsersList
					users={ item.wpcom_meta.extra.google_apps_users }
					gsuiteDiscountCallout={ gsuiteDiscountCallout }
				/>
			) }
			{ hasDeleteButton && formStatus === 'ready' && (
				<>
					<DeleteButton
						buttonType="borderless"
						disabled={ isDisabled }
						onClick={ () => {
							setIsModalVisible( true );
							onEvent( {
								type: 'a8c_checkout_delete_product_press',
								payload: {
									product_name: item.label,
								},
							} );
						} }
					>
						<DeleteIcon uniqueID={ deleteButtonId } product={ item.label } />
					</DeleteButton>

					<CheckoutModal
						isVisible={ isModalVisible }
						closeModal={ () => {
							setIsModalVisible( false );
						} }
						primaryAction={ () => {
							removeItem( item.wpcom_meta.uuid );
							onEvent( {
								type: 'a8c_checkout_delete_product',
								payload: {
									product_name: item.label,
								},
							} );
						} }
						cancelAction={ () => {
							onEvent( {
								type: 'a8c_checkout_cancel_delete_product',
							} );
						} }
						title={ modalCopy.title }
						copy={ modalCopy.description }
					/>
				</>
			) }

			{ shouldShowVariantSelector && (
				<ItemVariationPicker
					selectedItem={ item }
					variantSelectOverride={ variantSelectOverride }
					getItemVariants={ getItemVariants }
					onChangeItemVariant={ onChangePlanLength }
					isDisabled={ isDisabled }
				/>
			) }
		</div>
	);
}

WPLineItem.propTypes = {
	className: PropTypes.string,
	total: PropTypes.bool,
	isSummary: PropTypes.bool,
	isWhiteGloveOffer: PropTypes.bool,
	hasDeleteButton: PropTypes.bool,
	removeItem: PropTypes.func,
	item: PropTypes.shape( {
		label: PropTypes.string,
		amount: PropTypes.shape( {
			displayValue: PropTypes.string,
		} ),
	} ),
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	couponStatus: PropTypes.string,
};

function LineItemPrice( { item, isSummary } ) {
	return (
		<LineItemPriceUI isSummary={ isSummary }>
			{ item.amount.value < item.wpcom_meta?.item_original_subtotal_integer ? (
				<>
					<s>{ item.wpcom_meta?.item_original_subtotal_display }</s> { item.amount.displayValue }
				</>
			) : (
				renderDisplayValueMarkdown( item.amount.displayValue )
			) }
		</LineItemPriceUI>
	);
}

export const LineItemUI = styled( WPLineItem )`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: ${ ( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal ) };
	color: ${ ( { theme, total } ) =>
		total ? theme.colors.textColorDark : theme.colors.textColor };
	font-size: ${ ( { total } ) => ( total ? '1.2em' : '1.1em' ) };
	padding: ${ ( { total, tax, subtotal } ) => ( total || subtotal || tax ? '10px 0' : '20px 0' ) };
	border-bottom: ${ ( { theme, total } ) =>
		total ? 0 : '1px solid ' + theme.colors.borderColorLight };
	position: relative;

	.is-summary & {
		padding: 10px 0;
		border-bottom: 0;
	}
`;

const LineItemMeta = styled.div`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	display: flex;
	font-size: 14px;
	justify-content: space-between;
	width: 100%;
`;

const DiscountCalloutUI = styled.div`
	color: ${ ( props ) => props.theme.colors.success };
	text-align: right;
`;

const LineItemTitle = styled.div`
	flex: 1;
	word-break: break-word;
	font-size: ${ ( { isSummary } ) => ( isSummary ? '14px' : '16px' ) };
`;

const LineItemPriceUI = styled.span`
	margin-left: 12px;
	font-size: ${ ( { isSummary } ) => ( isSummary ? '14px' : '16px' ) };
`;

const DeleteButton = styled( Button )`
	position: absolute;
	padding: 10px;
	right: -50px;
	top: 7px;

	:hover rect {
		fill: ${ ( props ) => props.theme.colors.error };
	}

	svg {
		opacity: 1;
	}
`;

function DeleteIcon( { uniqueID, product } ) {
	const translate = useTranslate();

	return (
		<svg
			width="25"
			height="24"
			viewBox="0 0 25 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-labelledby={ uniqueID }
		>
			<title id={ uniqueID }>
				{ translate( 'Remove %s from cart', {
					args: product,
				} ) }
			</title>
			<mask
				id="trashIcon"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="5"
				y="3"
				width="15"
				height="18"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M15.4456 3L16.4456 4H19.9456V6H5.94557V4H9.44557L10.4456 3H15.4456ZM6.94557 19C6.94557 20.1 7.84557 21 8.94557 21H16.9456C18.0456 21 18.9456 20.1 18.9456 19V7H6.94557V19ZM8.94557 9H16.9456V19H8.94557V9Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#trashIcon)">
				<rect x="0.945572" width="24" height="24" fill="#8E9196" />
			</g>
		</svg>
	);
}

export function WPOrderReviewTotal( { total, className } ) {
	return (
		<div className={ joinClasses( [ className, 'order-review-total' ] ) }>
			<LineItemUI total item={ total } />
		</div>
	);
}

export function WPOrderReviewLineItems( {
	items,
	className,
	isSummary,
	removeItem,
	removeCoupon,
	variantSelectOverride,
	getItemVariants,
	onChangePlanLength,
	couponStatus,
	isWhiteGloveOffer,
} ) {
	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ items
				.filter( ( item ) => item.label ) // remove items without a label
				.map( ( item ) => {
					if ( isSummary && ! shouldLineItemBeShownWhenStepInactive( item ) ) {
						return;
					}

					return (
						<WPOrderReviewListItem key={ item.id }>
							<LineItemUI
								item={ item }
								hasDeleteButton={ ! isSummary && canItemBeDeleted( item ) }
								removeItem={ item.type === 'coupon' ? removeCoupon : removeItem }
								variantSelectOverride={ variantSelectOverride }
								getItemVariants={ getItemVariants }
								onChangePlanLength={ onChangePlanLength }
								couponStatus={ couponStatus }
								isSummary={ isSummary }
								isWhiteGloveOffer={ isWhiteGloveOffer }
							/>
						</WPOrderReviewListItem>
					);
				} ) }
		</WPOrderReviewList>
	);
}

WPOrderReviewLineItems.propTypes = {
	className: PropTypes.string,
	isSummary: PropTypes.bool,
	removeItem: PropTypes.func,
	removeCoupon: PropTypes.func,
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.string,
			amount: PropTypes.shape( {
				displayValue: PropTypes.string,
			} ),
		} )
	),
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	couponStatus: PropTypes.string,
};

const WPOrderReviewList = styled.ul`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	box-sizing: border-box;
	margin: 20px 30px 20px 0;

	.is-summary & {
		border-top: 0;
		margin: 0;
	}
`;

const WPOrderReviewListItem = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

function GSuiteUsersList( { users, gsuiteDiscountCallout } ) {
	return (
		<>
			{ users.map( ( user, index ) => {
				return (
					<LineItemMeta key={ user.email }>
						<div key={ user.email }>{ user.email }</div>
						{ index === 0 && gsuiteDiscountCallout }
					</LineItemMeta>
				);
			} ) }
		</>
	);
}

function returnModalCopy( product, translate, hasDomainsInCart ) {
	const modalCopy = {};
	const productType = product === 'plan' && hasDomainsInCart ? 'plan with dependencies' : product;

	switch ( productType ) {
		case 'plan with dependencies':
			modalCopy.title = translate( 'You are about to remove your plan from the cart' );
			modalCopy.description = translate(
				'When you press Continue, we will remove your plan from the cart and your site will continue to run with its current plan. Since your other product(s) depend on your plan to be purchased, they will also be removed from the cart and we will take you back to your site.'
			);
			break;
		case 'plan':
			modalCopy.title = translate( 'You are about to remove your plan from the cart' );
			modalCopy.description = translate(
				'When you press Continue, we will remove your plan from the cart and your site will continue to run with its current plan. We will then take you back to your site.'
			);
			break;
		case 'domain':
			modalCopy.title = translate( 'You are about to remove your domain from the cart' );
			modalCopy.description = translate(
				'When you press Continue, we will remove your domain from the cart and you will have no claim for the domain name you picked.'
			);
			break;
		case 'coupon':
			modalCopy.title = translate( 'You are about to remove your coupon from the cart' );
			modalCopy.description = translate(
				'When you press Continue, we will need you to confirm your payment details.'
			);
			break;
		default:
			modalCopy.title = translate( 'You are about to remove your product from the cart' );
			modalCopy.description = translate(
				'When you press Continue, we will remove your product from the cart and your site will continue to run without it.'
			);
	}

	return modalCopy;
}

function canItemBeDeleted( item ) {
	const itemTypesThatCannotBeDeleted = [
		'domain_redemption',
		'tax',
		'credits',
		'wordpress-com-credits',
	];
	return ! itemTypesThatCannotBeDeleted.includes( item.type );
}

function shouldLineItemBeShownWhenStepInactive( item ) {
	const itemTypesToIgnore = [ 'tax', 'credits', 'wordpress-com-credits' ];
	return ! itemTypesToIgnore.includes( item.type );
}

function LineItemSublabelAndPrice( { item } ) {
	const translate = useTranslate();
	const isDomainRegistration = item.wpcom_meta?.is_domain_registration;
	const isDomainMap = item.type === 'domain_map';
	const isGSuite = !! item.wpcom_meta?.extra?.google_apps_users?.length;

	if ( item.type === 'plan' && item.wpcom_meta?.months_per_bill_period ) {
		return translate( '%(sublabel)s: %(monthlyPrice)s per month × %(monthsPerBillPeriod)s', {
			args: {
				sublabel: item.sublabel,
				monthlyPrice: item.wpcom_meta.item_subtotal_monthly_cost_display,
				monthsPerBillPeriod: item.wpcom_meta.months_per_bill_period,
			},
			comment: 'product type and monthly breakdown of total cost, separated by a colon',
		} );
	}
	if (
		( isDomainRegistration || isDomainMap || isGSuite ) &&
		item.wpcom_meta?.months_per_bill_period === 12
	) {
		return translate( '%(sublabel)s: %(interval)s', {
			args: {
				sublabel: item.sublabel,
				interval: translate( 'billed annually' ),
			},
			comment: 'product type and billing interval, separated by a colon',
		} );
	}
	return item.sublabel || null;
}

function SavingsList( { item } ) {
	const translate = useTranslate();
	const savingsItems = [];
	if ( item.wpcom_meta?.couponCode ) {
		savingsItems.push( {
			type: 'coupon',
			label: translate( 'Coupon: %s', { args: item.wpcom_meta?.couponCode } ),
		} );
	}
	if ( savingsItems.length < 1 ) {
		return null;
	}
	return (
		<LineItemMeta className="savings-list">
			{ savingsItems.map( ( savingsItem ) => (
				<LineItemMeta
					className="savings-list__item"
					key={ savingsItem.label }
					data-savings-type={ savingsItem.type }
				>
					{ savingsItem.label }
				</LineItemMeta>
			) ) }
		</LineItemMeta>
	);
}
