import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestActivePromotions } from 'calypso/state/active-promotions/actions';
import { isRequestingActivePromotions } from 'calypso/state/active-promotions/selectors';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingActivePromotions( getState() ) ) {
		dispatch( requestActivePromotions() );
	}
};

export default function QueryActivePromotions() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
