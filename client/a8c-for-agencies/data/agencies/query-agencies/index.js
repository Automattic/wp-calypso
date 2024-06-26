import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgencies } from 'calypso/state/a8c-for-agencies/agency/actions';
import { hasFetchedAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const useQueryAgencies = () => {
	const dispatch = useDispatch();
	const hasFetched = useSelector( hasFetchedAgency );

	useEffect( () => {
		if ( ! hasFetched ) {
			dispatch( fetchAgencies() );
		}
	}, [ hasFetched, dispatch ] );
};

export default function QueryAgencies() {
	useQueryAgencies();

	return null;
}
