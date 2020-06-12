/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useLineItems, useFormStatus } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import { WPOrderReviewLineItems, WPOrderReviewSection } from './wp-order-review-line-items';
import { isLineItemADomain } from '../hooks/has-domains';

export default function WPCheckoutOrderReview( {
	className,
	removeItem,
	removeCoupon,
	couponStatus,
	couponFieldStateProps,
	variantSelectOverride,
	getItemVariants,
	onChangePlanLength,
	siteUrl,
	isSummary,
	isWhiteGloveOffer,
} ) {
	const translate = useTranslate();
	const [ items, total ] = useLineItems();
	const [ isCouponFieldVisible, setCouponFieldVisible ] = useState( false );
	const isPurchaseFree = total.amount.value === 0;

	const firstDomainItem = items.find( isLineItemADomain );
	const domainUrl = firstDomainItem ? firstDomainItem.label : siteUrl;
	const removeCouponAndClearField = ( uuid ) => {
		removeCoupon( uuid );
		couponFieldStateProps.setCouponFieldValue( '' );
		setCouponFieldVisible( false );
	};

	return (
		<div
			className={ joinClasses( [ className, 'checkout-review-order', isSummary && 'is-summary' ] ) }
		>
			{ domainUrl && <DomainURL>{ translate( 'Site: %s', { args: domainUrl } ) }</DomainURL> }

			<WPOrderReviewSection>
				<WPOrderReviewLineItems
					items={ items }
					removeItem={ removeItem }
					removeCoupon={ removeCouponAndClearField }
					variantSelectOverride={ variantSelectOverride }
					getItemVariants={ getItemVariants }
					onChangePlanLength={ onChangePlanLength }
					couponStatus={ couponStatus }
					isSummary={ isSummary }
					isWhiteGloveOffer={ isWhiteGloveOffer }
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
	removeItem: PropTypes.func,
	removeCoupon: PropTypes.func,
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	siteUrl: PropTypes.string,
	couponStatus: PropTypes.string,
	couponFieldStateProps: PropTypes.object.isRequired,
	variantSelectOverride: PropTypes.array,
};

function CouponFieldArea( {
	isCouponFieldVisible,
	setCouponFieldVisible,
	isPurchaseFree,
	couponStatus,
	couponFieldStateProps,
} ) {
	const { formStatus } = useFormStatus();
	const translate = useTranslate();

	if ( isPurchaseFree || couponStatus === 'applied' ) {
		return null;
	}

	if ( isCouponFieldVisible ) {
		return (
			<CouponField
				id="order-review-coupon"
				disabled={ formStatus !== 'ready' }
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
