import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestPlans } from 'calypso/state/plans/actions';
import { isRequestingPlans } from 'calypso/state/plans/selectors';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingPlans( getState() ) ) {
		dispatch( requestPlans() );
	}
};

export default function QueryPlans() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
