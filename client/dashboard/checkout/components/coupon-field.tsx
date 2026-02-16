import {
	Button,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import type { CouponStatus } from '@automattic/shopping-cart';

interface CouponFieldProps {
	applyCoupon: ( couponCode: string ) => Promise< unknown >;
	removeCoupon: () => Promise< unknown >;
	couponStatus: CouponStatus;
	appliedCoupon: string;
}

export function CouponField( {
	applyCoupon,
	removeCoupon,
	couponStatus,
	appliedCoupon,
}: CouponFieldProps ) {
	const [ couponCode, setCouponCode ] = useState( '' );
	// Track if the user has edited the input after a rejection, so we can hide the error.
	const [ hasEditedSinceRejection, setHasEditedSinceRejection ] = useState( false );

	const isPending = couponStatus === 'pending';
	const isApplied = couponStatus === 'applied';
	const isRejected = couponStatus === 'rejected';

	const handleApply = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( couponCode.trim() ) {
			setHasEditedSinceRejection( false );
			void applyCoupon( couponCode.trim() );
		}
	};

	const handleRemove = () => {
		void removeCoupon();
		setCouponCode( '' );
	};

	const handleChange = ( value: string ) => {
		setCouponCode( value );
		if ( isRejected ) {
			setHasEditedSinceRejection( true );
		}
	};

	if ( isApplied ) {
		return (
			<HStack justify="space-between">
				<Text style={ { fontSize: '0.875rem' } }>
					{ __( 'Coupon:' ) } <strong>{ appliedCoupon }</strong>
				</Text>
				<Button variant="link" size="compact" onClick={ handleRemove } disabled={ isPending }>
					{ __( 'Remove' ) }
				</Button>
			</HStack>
		);
	}

	return (
		<form onSubmit={ handleApply }>
			<HStack alignment="flex-end" spacing={ 2 }>
				<VStack spacing={ 0 } style={ { flex: 1 } }>
					<TextControl
						label={ __( 'Coupon code' ) }
						value={ couponCode }
						onChange={ handleChange }
						placeholder={ __( 'Enter coupon code' ) }
						disabled={ isPending }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
					/>
				</VStack>
				<Button
					type="submit"
					variant="secondary"
					size="compact"
					disabled={ isPending || ! couponCode.trim() }
					isBusy={ isPending }
				>
					{ isPending ? __( 'Applying…' ) : __( 'Apply' ) }
				</Button>
			</HStack>
			{ isRejected && ! hasEditedSinceRejection && (
				<Text style={ { color: '#d63638', fontSize: '0.75rem', marginBlockStart: '0.25rem' } }>
					{ __( 'This coupon code is not valid. Please check the code and try again.' ) }
				</Text>
			) }
		</form>
	);
}
