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
		<>
			{ hasCheckoutVersion( '2' ) && <CouponFieldHeader>Coupon code</CouponFieldHeader> }
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
					placeholder={ String( translate( 'Enter your coupon code' ) ) }
					isError={ hasCouponError && ! isFreshOrEdited }
					errorMessage={ errorMessage }
					onChange={ ( input ) => {
						setIsFreshOrEdited( true );
						setCouponFieldValue( input );
					} }
				/>
				{ ( hasCheckoutVersion( '2' ) || isApplyButtonActive ) && (
					<ApplyButton disabled={ isPending } buttonType="secondary">
						{ isPending ? translate( 'Processing…' ) : translate( 'Apply' ) }
					</ApplyButton>
				) }
			</CouponWrapper>
		</>
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

const CouponFieldHeader = styled.p`
	font-size: 14px;
	margin-bottom: 0.5em;
`;

const CouponWrapper = styled.form`
	margin: ${ hasCheckoutVersion( '2' ) ? '0 0 2em' : '0' };
	padding-top: 0;
	position: relative;
	display: ${ hasCheckoutVersion( '2' ) ? 'flex' : null };
	justify-content: ${ hasCheckoutVersion( '2' ) ? 'space-between' : null };
	column-gap: ${ hasCheckoutVersion( '2' ) ? '6px' : null };
	border-radius: 2px;

	& > div {
		flex: ${ hasCheckoutVersion( '2' ) ? '1 1 auto' : null };
	}

	.coupon-code {
		font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : null };
		padding: ${ hasCheckoutVersion( '2' ) ? '10px 16px' : null };
	}
`;

const ApplyButton = styled( Button )`
	position: ${ hasCheckoutVersion( '2' ) ? null : 'absolute' };
	padding: ${ hasCheckoutVersion( '2' ) ? '12px 16px' : '8px' };
	top: ${ hasCheckoutVersion( '2' ) ? '0' : '3px' };
	right: ${ hasCheckoutVersion( '2' ) ? '0' : '3px' };
	animation: ${ animateIn } 0.2s ease-out;
	animation-fill-mode: backwards;
	margin: 0;
	font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : null };
	max-height: ${ hasCheckoutVersion( '2' ) ? '43px' : null };

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
