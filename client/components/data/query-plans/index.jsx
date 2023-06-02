import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestPlans } from 'calypso/state/plans/actions';

export default function QueryPlans() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestPlans() );
	}, [ dispatch ] );

	return null;
}
