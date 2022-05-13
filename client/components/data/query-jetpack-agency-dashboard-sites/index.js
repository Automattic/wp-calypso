import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSites } from 'calypso/state/agency-dashboard/sites/actions';
import { hasFetchedSites } from 'calypso/state/agency-dashboard/sites/selectors';

export default function QueryJetpackAgencyDashboardSites() {
	const dispatch = useDispatch();
	const hasFetched = useSelector( hasFetchedSites );

	useEffect( () => {
		if ( ! hasFetched ) {
			dispatch( fetchSites() );
		}
	}, [ hasFetched, dispatch ] );

	return null;
}
