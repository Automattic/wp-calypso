import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSiteDomainsInBulk } from 'calypso/state/sites/domains/actions';
import { isRequestingSiteDomainsInBulk } from 'calypso/state/sites/domains/selectors';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingSiteDomainsInBulk( getState() ) ) {
		dispatch( fetchSiteDomainsInBulk() );
	}
};

export default function QueryAllDomainsWithDetails() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
