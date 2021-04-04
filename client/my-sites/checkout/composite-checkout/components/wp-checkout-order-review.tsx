/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { RemoveProductFromCart, CouponStatus } from '@automattic/shopping-cart';
import { styled } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import { WPOrderReviewLineItems, WPOrderReviewSection } from './wp-order-review-line-items';
import { isDomainRegistration, isDomainTransfer } from 'calypso/lib/products-values';
import type { CouponFieldStateProps } from '../hooks/use-coupon-field-state';
import type { GetProductVariants } from '../hooks/product-variants';
import type { OnChangeItemVariant } from './item-variation-picker';

const DomainURL = styled.div`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	margin-top: -10px;
	word-break: break-word;

	.is-summary & {
		margin-bottom: 10px;
	}
`;

const CouponLinkWrapper = styled.div`
	font-size: 14px;
	margin: 10px 0 20px;

	.is-summary & {
		margin-bottom: 0;
	}
`;

const CouponField = styled( Coupon )`
	margin: 20px 30px 20px 0;

	.rtl & {
		margin: 20px 0 20px 30px;
	}

	.is-summary & {
		margin: 10px 0 0;
	}
`;

const CouponEnableButton = styled.button`
	cursor: pointer;
	text-decoration: underline;
	color: ${ ( props ) => props.theme.colors.highlight };
	font-size: 14px;

	:hover {
		text-decoration: none;
	}
`;

export default function WPCheckoutOrderReview( {
	className,
	removeProductFromCart,
	couponFieldStateProps,
	getItemVariants,
	onChangePlanLength,
	siteUrl,
	isSummary,
	createUserAndSiteBeforeTransaction,
}: {
	className?: string;
	removeProductFromCart?: RemoveProductFromCart;
	couponFieldStateProps: CouponFieldStateProps;
	getItemVariants?: GetProductVariants;
	onChangePlanLength?: OnChangeItemVariant;
	siteUrl?: string;
	isSummary?: boolean;
	createUserAndSiteBeforeTransaction?: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const [ isCouponFieldVisible, setCouponFieldVisible ] = useState( false );
	const { responseCart, removeCoupon, couponStatus } = useShoppingCart();
	const isPurchaseFree = responseCart.total_cost_integer === 0;

	const firstDomainItem = responseCart.products.find(
		( product ) => isDomainTransfer( product ) || isDomainRegistration( product )
	);
	const domainUrl = firstDomainItem ? firstDomainItem.meta : siteUrl;
	const removeCouponAndClearField = () => {
		couponFieldStateProps.setCouponFieldValue( '' );
		setCouponFieldVisible( false );
		return removeCoupon();
	};

	return (
		<div
			className={ joinClasses( [ className, 'checkout-review-order', isSummary && 'is-summary' ] ) }
		>
			{ domainUrl && 'no-user' !== domainUrl && (
				<DomainURL>{ translate( 'Site: %s', { args: domainUrl } ) }</DomainURL>
			) }

			<WPOrderReviewSection>
				<WPOrderReviewLineItems
					removeProductFromCart={ removeProductFromCart }
					removeCoupon={ removeCouponAndClearField }
					getItemVariants={ getItemVariants }
					onChangePlanLength={ onChangePlanLength }
					isSummary={ isSummary }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
				/>
			</WPOrderReviewSection>

			<CouponFieldArea
				isCouponFieldVisible={ isCouponFieldVisible }
				setCouponFieldVisible={ setCouponFieldVisible }
				isPurchaseFree={ isPurchaseFree }
				couponStatus={ couponStatus }
				couponFieldStateProps={ couponFieldStateProps }
			/>
		</div>
	);
}

WPCheckoutOrderReview.propTypes = {
	isSummary: PropTypes.bool,
	className: PropTypes.string,
	removeProductFromCart: PropTypes.func,
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	siteUrl: PropTypes.string,
	couponFieldStateProps: PropTypes.object.isRequired,
};

function CouponFieldArea( {
	isCouponFieldVisible,
	setCouponFieldVisible,
	isPurchaseFree,
	couponStatus,
	couponFieldStateProps,
}: {
	isCouponFieldVisible: boolean;
	setCouponFieldVisible: ( visible: boolean ) => void;
	isPurchaseFree: boolean;
	couponStatus: CouponStatus;
	couponFieldStateProps: CouponFieldStateProps;
} ) {
	const { formStatus } = useFormStatus();
	const translate = useTranslate();
	const { setCouponFieldValue } = couponFieldStateProps;

	useEffect( () => {
		if ( couponStatus === 'applied' ) {
			// Clear the field value when the coupon is applied
			setCouponFieldValue( '' );
		}
	}, [ couponStatus, setCouponFieldValue ] );

	if ( isPurchaseFree || couponStatus === 'applied' ) {
		return null;
	}

	if ( isCouponFieldVisible ) {
		return (
			<CouponField
				id="order-review-coupon"
				disabled={ formStatus !== FormStatus.READY }
				couponStatus={ couponStatus }
				couponFieldStateProps={ couponFieldStateProps }
			/>
		);
	}

	return (
		<CouponLinkWrapper>
			{ translate( 'Have a coupon? ' ) }
			<CouponEnableButton
				className="wp-checkout-order-review__show-coupon-field-button"
				onClick={ () => setCouponFieldVisible( true ) }
			>
				{ translate( 'Add a coupon code' ) }
			</CouponEnableButton>
		</CouponLinkWrapper>
	);
}
