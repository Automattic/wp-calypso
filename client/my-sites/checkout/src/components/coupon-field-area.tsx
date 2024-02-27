import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useCheckoutV2 } from '../hooks/use-checkout-v2';
import Coupon from './coupon';
import type { CouponFieldStateProps } from '../hooks/use-coupon-field-state';
import type { CouponStatus } from '@automattic/shopping-cart';

const CouponLinkWrapper = styled.div< { shouldUseCheckoutV2: boolean } >`
	${ ( props ) => ( props.shouldUseCheckoutV2 ? `font-size: 12px;` : `font-size: 14px;` ) }
`;

const CouponAreaWrapper = styled.div< { shouldUseCheckoutV2: boolean } >`
	padding-bottom: ${ ( props ) => ( props.shouldUseCheckoutV2 ? '12px' : 'inherit' ) };
`;

const CouponField = styled( Coupon )``;

const CouponEnableButton = styled.button< { shouldUseCheckoutV2: boolean } >`
	cursor: pointer;
	text-decoration: underline;
	color: ${ ( props ) => props.theme.colors.highlight };

	&.wp-checkout-order-review__show-coupon-field-button {
		${ ( props ) => ( props.shouldUseCheckoutV2 ? `font-size: 12px` : `font-size: 14px;` ) }
	}
	:hover {
		text-decoration: none;
	}
`;

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
	const shouldUseCheckoutV2 = useCheckoutV2() === 'treatment';

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
			<CouponAreaWrapper shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
				<CouponField
					id="order-review-coupon"
					disabled={ formStatus !== FormStatus.READY }
					couponStatus={ couponStatus }
					couponFieldStateProps={ couponFieldStateProps }
				/>
			</CouponAreaWrapper>
		);
	}

	return (
		<CouponAreaWrapper shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
			<CouponLinkWrapper shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
				{ translate( 'Have a coupon? ' ) }{ ' ' }
				<CouponEnableButton
					className="wp-checkout-order-review__show-coupon-field-button"
					onClick={ () => setCouponFieldVisible( true ) }
					shouldUseCheckoutV2={ shouldUseCheckoutV2 }
				>
					{ translate( 'Add a coupon code' ) }
				</CouponEnableButton>
			</CouponLinkWrapper>
		</CouponAreaWrapper>
	);
}

export default CouponFieldArea;
