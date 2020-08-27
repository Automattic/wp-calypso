/**
 * External dependencies
 */
import { useEffect } from 'react';

export default function useDisplayErrors( errors, displayError ) {
	useEffect( () => {
		errors.filter( isNotCouponError ).map( ( error ) => displayError( error.message ) );
	}, [ errors, displayError ] );
}

function isNotCouponError( error ) {
	const couponErrorCodes = [
		'coupon-not-found',
		'coupon-already-used',
		'coupon-no-longer-valid',
		'coupon-expired',
		'coupon-unknown-error',
	];
	return ! couponErrorCodes.includes( error.code );
}
