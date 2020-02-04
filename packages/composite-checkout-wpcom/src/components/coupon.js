/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import { useEvents } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Field from './field';
import Button from './button';

export default function Coupon( { id, className, disabled, submitCoupon, couponStatus } ) {
	const translate = useTranslate();
	const onEvent = useEvents();
	const [ isApplyButtonActive, setIsApplyButtonActive ] = useState( false );
	const [ couponFieldValue, setCouponFieldValue ] = useState( '' );

	// Used to hide error messages if the user has edited the form field
	const [ isFreshOrEdited, setIsFreshOrEdited ] = useState( true );

	if ( couponStatus === 'applied' ) {
		return null;
	}

	const hasCouponError = couponStatus === 'invalid' || couponStatus === 'rejected';
	const isPending = couponStatus === 'pending';

	const errorMessage =
		// eslint-disable-next-line no-nested-ternary
		couponStatus === 'invalid' && ! isFreshOrEdited
			? translate( "We couldn't find your coupon. Please check your code and try again." )
			: couponStatus === 'rejected'
			? translate( 'This coupon does not apply to any items in the cart.' )
			: null;

	return (
		<CouponWrapper
			className={ joinClasses( [ className, 'coupon' ] ) }
			onSubmit={ event => {
				setIsFreshOrEdited( false );
				handleFormSubmit( event, couponFieldValue, onEvent, submitCoupon );
			} }
		>
			<Field
				id={ id }
				disabled={ disabled || isPending }
				placeholder={ translate( 'Enter your coupon code' ) }
				isError={ hasCouponError && ! isFreshOrEdited }
				errorMessage={ errorMessage }
				onChange={ input => {
					setIsFreshOrEdited( true );
					handleFieldInput( input, setCouponFieldValue, setIsApplyButtonActive );
				} }
			/>

			{ isApplyButtonActive && (
				<ApplyButton buttonState={ isPending ? 'disabled' : 'secondary' }>
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

const CouponWrapper = styled.form`
	margin: ${props => props.marginTop} 0 0 0;
	padding-top: 0;
	position: relative;
`;

const ApplyButton = styled( Button )`
	position: absolute;
	top: 5px;
	right: 4px;
	padding: 7px;
	animation: ${animateIn} 0.2s ease-out;
	animation-fill-mode: backwards;
	margin: 0;
`;

function handleFieldInput( input, setCouponFieldValue, setIsApplyButtonActive ) {
	if ( input.length > 0 ) {
		setCouponFieldValue( input );
		setIsApplyButtonActive( true );
		return;
	}

	setIsApplyButtonActive( false );
}

function handleFormSubmit( event, couponFieldValue, onEvent, submitCoupon ) {
	event.preventDefault();
	if ( isCouponValid( couponFieldValue ) ) {
		onEvent( {
			type: 'a8c_checkout_add_coupon',
			payload: { coupon: couponFieldValue },
		} );

		submitCoupon( couponFieldValue );

		return;
	}

	onEvent( {
		type: 'a8c_checkout_add_coupon_error',
		payload: { type: 'Invalid code' },
	} );
}

function isCouponValid( coupon ) {
	// TODO: figure out some basic validation here
	return coupon.match( /^[a-zA-Z0-9_-]+$/ );
}
