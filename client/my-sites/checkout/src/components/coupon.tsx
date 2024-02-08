import { Button } from '@automattic/composite-checkout';
import { Field, styled, joinClasses, hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { keyframes } from '@emotion/react';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import type { CouponFieldStateProps } from '../hooks/use-coupon-field-state';
import type { CouponStatus } from '@automattic/shopping-cart';

/* eslint-disable @typescript-eslint/no-use-before-define */

export default function Coupon( {
	id,
	className,
	disabled,
	couponStatus,
	couponFieldStateProps,
}: {
	id: string;
	className?: string;
	disabled?: boolean;
	couponStatus: CouponStatus;
	couponFieldStateProps: CouponFieldStateProps;
} ) {
	const translate = useTranslate();
	const {
		couponFieldValue,
		setCouponFieldValue,
		isApplyButtonActive,
		isFreshOrEdited,
		setIsFreshOrEdited,
		handleCouponSubmit,
	} = couponFieldStateProps;

	const hasCouponError = couponStatus === 'rejected';
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
			{ hasCheckoutVersion( '2' ) ? (
				<>
					<CouponLabel>Coupon code</CouponLabel>
					<CouponField
						id={ id }
						inputClassName="coupon-code"
						value={ couponFieldValue }
						disabled={ disabled || isPending }
						placeholder={ String( translate( 'Enter your coupon code' ) ) }
						isError={ hasCouponError && ! isFreshOrEdited }
						errorMessage={ errorMessage }
						onChange={ ( input ) => {
							setIsFreshOrEdited( true );
							setCouponFieldValue( input );
						} }
					/>
				</>
			) : (
				<Field
					id={ id }
					inputClassName="coupon-code"
					value={ couponFieldValue }
					disabled={ disabled || isPending }
					placeholder={ String( translate( 'Enter your coupon code' ) ) }
					isError={ hasCouponError && ! isFreshOrEdited }
					errorMessage={ errorMessage }
					onChange={ ( input ) => {
						setIsFreshOrEdited( true );
						setCouponFieldValue( input );
					} }
				/>
			) }

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
	margin: 0;
	padding-top: 0;
	position: relative;

	${ hasCheckoutVersion( '2' )
		? `display: grid; 
		align-items: center; 
		justify-content: space-between; 
		grid-template-columns: 1fr max-content; 
		grid-template-areas: 
		'label     .  '
		'field  button';
		gap: .5em;`
		: null }
`;

const CouponLabel = styled.label`
	font-size: 12px;
	font-weight: 600;
	grid-area: label;
`;

const CouponField = styled( Field )`
	grid-area: field;
`;

const ApplyButton = styled( Button )`
	animation: ${ animateIn } 0.2s ease-out;
	animation-fill-mode: backwards;
	margin: 0;

	${ hasCheckoutVersion( '2' )
		? `position: relative; font-size: 14px; min-width: 70px; height: 37px; padding: 0 8px; grid-area: button; align-self: flex-start;`
		: `position: absolute; padding: 8px;
	top: 3px;
	right: 3px;` }

	.rtl & {
		animation-name: ${ animateInRTL };
		left: 4px;
		right: auto;
	}
`;

function getCouponErrorMessageFromStatus(
	translate: ReturnType< typeof useTranslate >,
	status: CouponStatus,
	isFreshOrEdited: boolean
): string | undefined {
	if ( status === 'rejected' && ! isFreshOrEdited ) {
		if (
			getLocaleSlug() === 'en' ||
			getLocaleSlug() === 'en-gb' ||
			i18n.hasTranslation( 'There was a problem applying this coupon.' )
		) {
			return translate( 'There was a problem applying this coupon.', { textOnly: true } );
		}
		return String(
			translate( "We couldn't find your coupon. Please check your coupon code and try again." )
		);
	}
	return undefined;
}
