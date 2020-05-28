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
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Button from './button';
import { useHasDomainsInCart } from '../hooks/has-domains';
import { ItemVariationPicker } from './item-variation-picker';

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
	variantRequestStatus,
	variantSelectOverride,
	getItemVariants,
	onChangePlanLength,
	couponStatus,
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

	// Show the variation picker when this is not a renewal
	const shouldShowVariantSelector = item.wpcom_meta && ! item.wpcom_meta.extra?.purchaseId;
	const isGSuite = !! item.wpcom_meta?.extra?.google_apps_users?.length;

	let sublabelAndIntervalPriceBreakdown = '';
	if ( 'plan' === item.type && item.wpcom_meta?.months_per_bill_period ) {
		sublabelAndIntervalPriceBreakdown = translate(
			'%(sublabel)s: %(monthlyPrice)s per month × %(monthsPerBillPeriod)s',
			{
				args: {
					sublabel: item.sublabel,
					monthlyPrice: item.wpcom_meta.item_original_monthly_cost_display,
					monthsPerBillPeriod: item.wpcom_meta.months_per_bill_period,
				},
				comment: 'product type and monthly breakdown of total cost, separated by a colon',
			}
		);
	} else if ( 'plan' !== item.type || ! shouldShowVariantSelector ) {
		sublabelAndIntervalPriceBreakdown = translate( '%(sublabel)s: %(interval)s', {
			args: {
				sublabel: item.sublabel,
				interval: translate( 'billed annually' ),
			},
			comment: 'product type and billing interval, separated by a colon',
		} );
	} else {
		sublabelAndIntervalPriceBreakdown = item.sublabel;
	}
	const productName = isWhiteGloveOffer ? `${ item.label } (White glove edition)` : item.label;

	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<LineItemTitle id={ itemSpanId }>{ productName }</LineItemTitle>
			<span aria-labelledby={ itemSpanId }>
				<LineItemPrice item={ item } />
			</span>
			{ item.sublabel && (
				<LineItemMeta singleLine={ true }>
					{ sublabelAndIntervalPriceBreakdown }
					{ item.wpcom_meta?.is_bundled && item.amount.value === 0 && (
						<DiscountCalloutUI>{ translate( 'First year free' ) }</DiscountCalloutUI>
					) }
				</LineItemMeta>
			) }
			{ isGSuite && (
				<LineItemMeta singleLine={ true }>
					{ item.amount.value < item.wpcom_meta?.item_original_cost_integer &&
						couponStatus !== 'applied' && (
							<DiscountCalloutUI>{ translate( 'Discount for first year' ) }</DiscountCalloutUI>
						) }
				</LineItemMeta>
			) }
			{ isGSuite && <GSuiteUsersList users={ item.wpcom_meta.extra.google_apps_users } /> }
			{ hasDeleteButton && formStatus === 'ready' && (
				<>
					<DeleteButton
						buttonState="borderless"
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
					variantRequestStatus={ variantRequestStatus }
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
	isSummaryVisible: PropTypes.bool,
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

function LineItemPrice( { item } ) {
	return (
		<LineItemPriceUI>
			{ item.amount.value < item.wpcom_meta?.item_original_cost_integer ? (
				<>
					<s>{ item.wpcom_meta?.item_original_cost_display }</s> { item.amount.displayValue }
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
	font-weight: ${( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal) };
	color: ${( { theme, total } ) => ( total ? theme.colors.textColorDark : theme.colors.textColor) };
	font-size: ${( { total } ) => ( total ? '1.2em' : '1.1em') };
	padding: ${( { total, isSummaryVisible, tax, subtotal } ) =>
		isSummaryVisible || total || subtotal || tax ? '10px 0' : '20px 0'};
	border-bottom: ${( { theme, total, isSummaryVisible } ) =>
		isSummaryVisible || total ? 0 : '1px solid ' + theme.colors.borderColorLight};
	position: relative;
`;

const LineItemMeta = styled.div`
	color: ${( props ) => props.theme.colors.textColorLight};
	display: ${( { singleLine } ) => ( singleLine ? 'flex' : 'block') };
	font-size: 14px;
	justify-content: space-between;
	width: 100%;
`;

const DiscountCalloutUI = styled.div`
	color: ${( props ) => props.theme.colors.success};
	text-align: right;
`;

const LineItemTitle = styled.div`
	flex: 1;
	word-break: break-word;
`;

const LineItemPriceUI = styled.span`
	margin-left: 12px;
`;

const DeleteButton = styled( Button )`
	position: absolute;
	padding: 10px;
	right: -50px;
	top: 7px;

	:hover rect {
		fill: ${( props ) => props.theme.colors.error};
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
	isSummaryVisible,
	removeItem,
	removeCoupon,
	variantRequestStatus,
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
				.map( ( item ) => (
					<WPOrderReviewListItem key={ item.id }>
						<LineItemUI
							isSummaryVisible={ isSummaryVisible }
							item={ item }
							isWhiteGloveOffer={ isWhiteGloveOffer }
							hasDeleteButton={ canItemBeDeleted( item ) }
							removeItem={ item.type === 'coupon' ? removeCoupon : removeItem }
							variantRequestStatus={ variantRequestStatus }
							variantSelectOverride={ variantSelectOverride }
							getItemVariants={ getItemVariants }
							onChangePlanLength={ onChangePlanLength }
							couponStatus={ couponStatus }
						/>
					</WPOrderReviewListItem>
				) ) }
		</WPOrderReviewList>
	);
}

WPOrderReviewLineItems.propTypes = {
	className: PropTypes.string,
	isSummaryVisible: PropTypes.bool,
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
	border-top: 1px solid ${( props ) => props.theme.colors.borderColorLight};
	box-sizing: border-box;
	margin: 20px 30px 20px 0;
`;

const WPOrderReviewListItem = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

function GSuiteUsersList( { users } ) {
	return (
		<LineItemMeta singleLine={ false }>
			{ users.map( ( { email } ) => (
				<div key={ email }>{ email }</div>
			) ) }
		</LineItemMeta>
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
