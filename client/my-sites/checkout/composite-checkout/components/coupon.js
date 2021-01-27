/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Field from './field';

export default function Coupon( { id, className, disabled, couponStatus, couponFieldStateProps } ) {
	const translate = useTranslate();
	const {
		couponFieldValue,
		setCouponFieldValue,
		isApplyButtonActive,
		isFreshOrEdited,
		setIsFreshOrEdited,
		handleCouponSubmit,
	} = couponFieldStateProps;

	const hasCouponError = couponStatus === 'invalid' || couponStatus === 'rejected';
	const isPending = couponStatus === 'pending';

	const errorMessage = getCouponErrorMessageFromStatus( translate, couponStatus, isFreshOrEdited );

	return (
		<CouponWrapper
			className={ joinClasses( [ className, 'coupon' ] ) }
			onSubmit={ ( event ) => {
				event.preventDefault();
				setIsFreshOrEdited( false );
				handleCouponSubmit();
			} }
		>
			<Field
				id={ id }
				inputClassName="coupon-code"
				value={ couponFieldValue }
				disabled={ disabled || isPending }
				placeholder={ translate( 'Enter your coupon code' ) }
				isError={ hasCouponError && ! isFreshOrEdited }
				errorMessage={ errorMessage }
				onChange={ ( input ) => {
					setIsFreshOrEdited( true );
					setCouponFieldValue( input );
				} }
			/>

			{ isApplyButtonActive && (
				<ApplyButton disabled={ isPending } buttonType="secondary">
					{ isPending ? translate( 'Processing…' ) : translate( 'Apply' ) }
				</ApplyButton>
			) }
		</CouponWrapper>
	);
}

Coupon.propTypes = {
	id: PropTypes.string.isRequired,
	couponAdded: PropTypes.func,
	disabled: PropTypes.bool,
};

const animateIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const animateInRTL = keyframes`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CouponWrapper = styled.form`
	margin: ${ ( props ) => props.marginTop } 0 0;
	padding-top: 0;
	position: relative;
`;

const ApplyButton = styled( Button )`
	position: absolute;
	top: 3px;
	right: 3px;
	padding: 8px;
	animation: ${ animateIn } 0.2s ease-out;
	animation-fill-mode: backwards;
	margin: 0;

	.rtl & {
		animation-name: ${ animateInRTL };
		left: 4px;
		right: auto;
	}
`;

function getCouponErrorMessageFromStatus( translate, status, isFreshOrEdited ) {
	if ( status === 'invalid' && ! isFreshOrEdited ) {
		return translate(
			"We couldn't find your coupon. Please check your coupon code and try again."
		);
	}
	if ( status === 'rejected' ) {
		return translate( 'This coupon does not apply to any items in the cart.' );
	}
	return null;
}
