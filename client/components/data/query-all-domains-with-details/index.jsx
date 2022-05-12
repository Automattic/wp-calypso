import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTestSiteDomains } from 'calypso/state/sites/domains/actions';
import isRequestingAllDomainsWithDetails from 'calypso/state/selectors/is-requesting-all-domains-with-details';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingAllDomainsWithDetails( getState() ) ) {
		dispatch( fetchTestSiteDomains() );
	}
};

export default function QueryAllDomainsWithDetails() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
