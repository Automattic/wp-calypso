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
import { useHasDomainsInCart, isLineItemADomain } from '../hooks/has-domains';
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

	const shouldShowVariantSelector = item.wpcom_meta && item.wpcom_meta.extra?.context === 'signup';

	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<LineItemTitle id={ itemSpanId } item={ item } />
			<span aria-labelledby={ itemSpanId }>
				<LineItemPrice lineItem={ item } />
			</span>
			{ hasDeleteButton && formStatus === 'ready' && (
				<React.Fragment>
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
				</React.Fragment>
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
};

function LineItemTitle( { item, id } ) {
	if ( isLineItemADomain( item ) ) {
		return <LineItemDomainTitle item={ item } id={ id } />;
	}
	if ( item.type === 'domain_map' || item.type === 'offsite_redirect' ) {
		return <LineItemDomainTitle item={ item } id={ id } />;
	}
	return (
		<LineItemTitleUI>
			<ProductTitleUI id={ id }>{ item.label }</ProductTitleUI>
		</LineItemTitleUI>
	);
}

function LineItemDomainTitle( { item, id } ) {
	const translate = useTranslate();
	return (
		<LineItemTitleUI>
			<ProductTitleUI id={ id }>
				{ item.label }: { item.sublabel }
			</ProductTitleUI>
			{ item.wpcom_meta?.is_bundled && item.amount.value === 0 && (
				<BundledDomainFreeUI>{ translate( 'First year free with your plan' ) }</BundledDomainFreeUI>
			) }
		</LineItemTitleUI>
	);
}

function LineItemPrice( { lineItem } ) {
	return (
		<LineItemPriceUI>
			{ lineItem.amount.value < lineItem.wpcom_meta?.product_cost_integer ? (
				<>
					<s>{ lineItem.wpcom_meta.product_cost_display }</s> { lineItem.amount.displayValue }
				</>
			) : (
				renderDisplayValueMarkdown( lineItem.amount.displayValue )
			) }
		</LineItemPriceUI>
	);
}

export const LineItemUI = styled( WPLineItem )`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: ${( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal )};
	color: ${( { theme, total } ) => ( total ? theme.colors.textColorDark : theme.colors.textColor )};
	font-size: ${( { total } ) => ( total ? '1.2em' : '1em' )};
	padding: ${( { total, isSummaryVisible, tax, subtotal } ) =>
		isSummaryVisible || total || subtotal || tax ? '10px 0' : '24px 0'};
	border-bottom: ${( { theme, total, isSummaryVisible } ) =>
		isSummaryVisible || total ? 0 : '1px solid ' + theme.colors.borderColorLight};
	position: relative;
	margin-right: ${( { total, tax, subtotal } ) => ( subtotal || total || tax ? '0' : '30px' )};
`;

const LineItemTitleUI = styled.div`
	flex: 1;
	word-break: break-word;
`;

const LineItemPriceUI = styled.span`
	margin-left: 12px;
`;

const BundledDomainFreeUI = styled.div`
	color: ${props => props.theme.colors.success};
`;

const ProductTitleUI = styled.div`
	flex: 1;
`;

const DeleteButton = styled( Button )`
	position: absolute;
	padding: 10px;
	right: -50px;
	top: 10px;

	:hover rect {
		fill: ${props => props.theme.colors.error};
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
} ) {
	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ items.map( item => (
				<WPOrderReviewListItems key={ item.id }>
					<LineItemUI
						isSummaryVisible={ isSummaryVisible }
						item={ item }
						hasDeleteButton={ canItemBeDeleted( item ) }
						removeItem={ item.type === 'coupon' ? removeCoupon : removeItem }
						variantRequestStatus={ variantRequestStatus }
						variantSelectOverride={ variantSelectOverride }
						getItemVariants={ getItemVariants }
						onChangePlanLength={ onChangePlanLength }
					/>
				</WPOrderReviewListItems>
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
};

const WPOrderReviewList = styled.ul`
	margin: -10px 0 10px 0;
	padding: 0;
`;

const WPOrderReviewListItems = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;

	:first-of-type .checkout-line-item {
		padding-top: 10px;
	}

	:first-of-type button {
		top: -3px;
	}
`;

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
