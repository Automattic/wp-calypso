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
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Button from './button';
import RadioButton from './radio-button';
import { useHasDomainsInCart } from '../hooks/has-domains';

export function WPOrderReviewSection( { children, className } ) {
	return (
		<OrderReviewSectionArea className={ joinClasses( [ className, 'order-review-section' ] ) }>
			{ children }
		</OrderReviewSectionArea>
	);
}

WPOrderReviewSection.propTypes = {
	className: PropTypes.string,
};

const OrderReviewSectionArea = styled.div`
	margin-bottom: 16px;
`;

function WPLineItem( { item, className, hasDeleteButton, removeItem } ) {
	const translate = useTranslate();
	const hasDomainsInCart = useHasDomainsInCart();
	const { formStatus } = useFormStatus();
	const itemSpanId = `checkout-line-item-${ item.id }`;
	const deleteButtonId = `checkout-delete-button-${ item.id }`;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const modalCopy = returnModalCopy( item.type, translate, hasDomainsInCart );

	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<ProductTitle id={ itemSpanId }>{ item.label }</ProductTitle>
			<span aria-labelledby={ itemSpanId }>
				{ renderDisplayValueMarkdown( item.amount.displayValue ) }
			</span>
			{ hasDeleteButton && formStatus === 'ready' && (
				<React.Fragment>
					<DeleteButton
						buttonState="borderless"
						onClick={ () => {
							setIsModalVisible( true );
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
						} }
						title={ modalCopy.title }
						copy={ modalCopy.description }
					/>
				</React.Fragment>
			) }

			{ item.type === 'plan' && <PlanTermOptions /> }
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
};

const LineItemUI = styled( WPLineItem )`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: ${( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal )};
	color: ${( { theme, total } ) => ( total ? theme.colors.textColorDark : theme.colors.textColor )};
	font-size: ${( { total } ) => ( total ? '1.2em' : '1em' )};
	padding: ${( { total, isSummaryVisible } ) => ( isSummaryVisible || total ? 0 : '24px 0' )};
	border-bottom: ${( { theme, total, isSummaryVisible } ) =>
		isSummaryVisible || total ? 0 : '1px solid ' + theme.colors.borderColorLight};
	position: relative;
	margin-right: 30px;
`;

const ProductTitle = styled.span`
	flex: 1;
`;

const Discount = styled.span`
	color: ${props => props.theme.colors.discount};
	margin-right: 8px;
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

const TermOptions = styled.ul`
	flex-basis: 100%;
	margin: 12px 0 0;
	padding: 0;
`;

const TermOptionsItem = styled.li`
	margin: 8px 0 0;
	padding: 0;
	list-style: none;

	:first-of-type {
		margin-top: 0;
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

export function WPOrderReviewLineItems( { items, className, isSummaryVisible, removeItem } ) {
	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ items.map( item => (
				<WPOrderReviewListItems key={ item.id }>
					<LineItemUI
						isSummaryVisible={ isSummaryVisible }
						item={ item }
						hasDeleteButton={ canItemBeDeleted( item ) }
						removeItem={ removeItem }
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
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.string,
			amount: PropTypes.shape( {
				displayValue: PropTypes.string,
			} ),
		} )
	),
};

const WPOrderReviewList = styled.ul`
	margin: -10px 0 0;
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

function PlanTermOptions() {
	const translate = useTranslate();
	const [ termDuration, setTermDuration ] = useState( 'one-year' );
	//TODO: Make these options dynamic and update the cart when a choice is selected.
	return (
		<TermOptions>
			<TermOptionsItem>
				<RadioButton
					name="term"
					id="one-year"
					value="$60"
					checked={ termDuration === 'one-year' }
					onChange={ () => {
						setTermDuration( 'one-year' );
					} }
					ariaLabel={ translate( 'One year term' ) }
					label={
						<React.Fragment>
							<ProductTitle>{ translate( 'One year' ) }</ProductTitle>
							<span>$60</span>
						</React.Fragment>
					}
				/>
			</TermOptionsItem>
			<TermOptionsItem>
				<RadioButton
					name="term"
					id="two-year"
					value="$60"
					checked={ termDuration === 'two-year' }
					onChange={ () => {
						setTermDuration( 'two-year' );
					} }
					ariaLabel={ translate( 'Two year term' ) }
					label={
						<React.Fragment>
							<ProductTitle>{ translate( 'Two years' ) }</ProductTitle>
							<Discount>Save 10%</Discount>
							<span>
								<s>$120</s> $108
							</span>
						</React.Fragment>
					}
				/>
			</TermOptionsItem>
		</TermOptions>
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
		default:
			modalCopy.title = translate( 'You are about to remove your product from the cart' );
			modalCopy.description = translate(
				'When you press Continue, we will remove your product from the cart and your site will continue to run without it.'
			);
	}

	return modalCopy;
}

function canItemBeDeleted( item ) {
	const itemTypesThatCannotBeDeleted = [ 'tax', 'coupon', 'credits', 'wordpress-com-credits' ];
	return ! itemTypesThatCannotBeDeleted.includes( item.type );
}
