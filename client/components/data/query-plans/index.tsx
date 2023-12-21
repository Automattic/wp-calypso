import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestPlans } from 'calypso/state/plans/actions';

const QueryPlans = ( { coupon }: { coupon?: string } ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestPlans( coupon ) );
	}, [ dispatch, coupon ] );

	return null;
};

export default QueryPlans;
