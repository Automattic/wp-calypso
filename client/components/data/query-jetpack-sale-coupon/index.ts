import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJetpackSaleCoupon } from 'calypso/state/marketing/actions';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';

export default function QueryJetpackSaleCoupon(): null {
	const dispatch = useDispatch();
	const saleCoupon = useSelector( getJetpackSaleCoupon );

	useEffect( () => {
		if ( ! saleCoupon ) {
			dispatch( fetchJetpackSaleCoupon() );
		}
	}, [ dispatch, saleCoupon ] );

	return null;
}
