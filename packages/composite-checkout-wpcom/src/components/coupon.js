/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Field from './field';
import Button from './button';

export default function Coupon( { id, couponAdded, className, isCouponFieldVisible } ) {
	const translate = useTranslate();
	const [ isApplyButtonActive, setIsApplyButtonActive ] = useState( false );
	const [ couponFieldValue, setCouponFieldValue ] = useState( '' );
	const [ hasCouponError, setHasCouponError ] = useState( false );
	const [ isCouponApplied, setIsCouponApplied ] = useState( false );

	if ( ! isCouponFieldVisible || isCouponApplied ) {
		return null;
	}

	return (
		<CouponWrapper
			className={ joinClasses( [ className, 'coupon' ] ) }
			onSubmit={ event => {
				handleFormSubmit(
					event,
					couponFieldValue,
					setHasCouponError,
					couponAdded,
					setIsCouponApplied
				);
			} }
		>
			<Field
				id={ id }
				placeholder={ translate( 'Enter your coupon code' ) }
				isError={ hasCouponError }
				errorMessage={
					hasCouponError
						? translate( "We couldn't find your coupon. Please check your code and try again." )
						: null
				}
				onChange={ input => {
					handleFieldInput( input, setCouponFieldValue, setIsApplyButtonActive, setHasCouponError );
				} }
			/>

			{ isApplyButtonActive && (
				<ApplyButton buttonState="secondary">{ translate( 'Apply' ) }</ApplyButton>
			) }
		</CouponWrapper>
	);
}

Coupon.propTypes = {
	id: PropTypes.string.isRequired,
	couponAdded: PropTypes.func,
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

function handleFieldInput( input, setCouponFieldValue, setIsApplyButtonActive, setHasCouponError ) {
	if ( input.length > 0 ) {
		setCouponFieldValue( input );
		setIsApplyButtonActive( true );
		setHasCouponError( false );
		return;
	}

	setIsApplyButtonActive( false );
}

function handleFormSubmit(
	event,
	couponFieldValue,
	setHasCouponError,
	couponAdded,
	setIsCouponApplied
) {
	event.preventDefault();

	//TODO: Validate coupon field and replace condition in the following if statement
	if ( couponFieldValue === 'Add' ) {
		setIsCouponApplied( true );

		if ( couponAdded ) {
			couponAdded();
		}

		return;
	}

	setHasCouponError( true );
}
