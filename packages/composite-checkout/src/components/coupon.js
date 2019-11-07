/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';
import joinClasses from '../lib/join-classes';
import Field from './field';
import Button from './button';
import Notice from './notice';

export default function Coupon( { id, couponAdded, className, isCouponFieldVisible } ) {
	const localize = useLocalize();
	const [ isApplyButtonActive, setIsApplyButtonActive ] = useState( false );
	const [ couponFieldValue, setCouponFieldValue ] = useState( '' );
	const [ hasCouponError, setHasCouponError ] = useState( false );
	const [ isNoticeVisible, setIsNoticeVisible ] = useState( false );
	const [ isCouponApplied, setIsCouponApplied ] = useState( false );

	useEffect( () => {
		if ( document.getElementById( id ) === document.activeElement ) {
			document.addEventListener(
				'keydown',
				key => {
					handleKeyPress(
						key,
						couponFieldValue,
						setHasCouponError,
						couponAdded,
						setIsCouponApplied,
						setIsNoticeVisible
					);
				},
				false
			);
		}
	} );

	if ( ! isCouponFieldVisible || isCouponApplied ) {
		if ( isNoticeVisible ) {
			return <NoticeComponent />;
		}

		return null;
	}

	return (
		<CouponWrapper className={ joinClasses( [ className, 'coupon' ] ) }>
			<Field
				id={ id }
				placeholder={ localize( 'Enter your coupon code' ) }
				isError={ hasCouponError }
				errorMessage={
					hasCouponError
						? localize( "We couldn't find your coupon. Please check your code and try again." )
						: null
				}
				onChange={ input => {
					handleFieldInput( input, setCouponFieldValue, setIsApplyButtonActive, setHasCouponError );
				} }
			/>

			{ isApplyButtonActive && (
				<ApplyButton
					buttonState="secondary"
					onClick={ value => {
						handleApplyButtonClick(
							value,
							setHasCouponError,
							couponAdded,
							setIsCouponApplied,
							setIsNoticeVisible
						);
					} }
				>
					{ localize( 'Apply' ) }
				</ApplyButton>
			) }

			{ isNoticeVisible && <NoticeComponent /> }
		</CouponWrapper>
	);
}

Coupon.propTypes = {
	id: PropTypes.string.isRequired,
	couponAdded: PropTypes.func,
};

function handleKeyPress(
	key,
	value,
	setHasCouponError,
	couponAdded,
	setIsCouponApplied,
	setIsNoticeVisible
) {
	if ( key.keyCode === 13 ) {
		handleApplyButtonClick(
			value,
			setHasCouponError,
			couponAdded,
			setIsCouponApplied,
			setIsNoticeVisible
		);
	}
}

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

const CouponWrapper = styled.div`
	margin: ${props => props.marginTop} 0 0 0;
	padding-top: 0;
	position: relative;
	width: 100%;
`;

const ApplyButton = styled( Button )`
	position: absolute;
	top: 4px;
	right: 4px;
	padding: 7px;
	animation: ${animateIn} 0.2s ease-out;
`;

function NoticeComponent() {
	const localize = useLocalize();

	return (
		<Notice type="success">
			{ localize( 'Your coupon for $20 has been applied to your cart' ) }
		</Notice>
	);
}

function handleApplyButtonClick(
	value,
	setHasCouponError,
	couponAdded,
	setIsCouponApplied,
	setIsNoticeVisible
) {
	//TODO: Validate coupon field and replace couponAdded in the following if statement
	if ( couponAdded ) {
		setIsNoticeVisible( true );
		setIsCouponApplied( true );
		setTimeout( () => {
			setIsNoticeVisible( false );
		}, 2000 );

		if ( couponAdded ) {
			couponAdded();
		}

		return;
	}

	setHasCouponError( true );
	return;
}

function handleFieldInput( input, setCouponFieldValue, setIsApplyButtonActive, setHasCouponError ) {
	if ( input.length > 0 ) {
		setCouponFieldValue( input );
		setIsApplyButtonActive( true );
		setHasCouponError( false );
		return;
	}

	setIsApplyButtonActive( false );
	return;
}
