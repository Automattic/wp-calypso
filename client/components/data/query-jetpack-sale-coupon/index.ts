import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchJetpackSaleCoupon } from 'calypso/state/marketing/actions';
import {
	getHasRequestedJetpackSaleCoupon,
	getIsRequestingJetpackSaleCoupon,
} from 'calypso/state/marketing/selectors';

export default function QueryJetpackSaleCoupon(): null {
	const dispatch = useDispatch();
	const hasRequestedCoupon = useSelector( getHasRequestedJetpackSaleCoupon );
	const isRequestingCoupon = useSelector( getIsRequestingJetpackSaleCoupon );

	useEffect( () => {
		if ( ! isRequestingCoupon && ! hasRequestedCoupon ) {
			dispatch( fetchJetpackSaleCoupon() );
		}
	}, [ dispatch, hasRequestedCoupon, isRequestingCoupon ] );

	return null;
}
