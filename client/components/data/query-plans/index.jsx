import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestPlans } from 'calypso/state/plans/actions';

export default function QueryPlans( { coupon } = {} ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestPlans( coupon ) );
	}, [ dispatch, coupon ] );

	return null;
}
