import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTestSiteDomains } from 'calypso/state/sites/domains/actions';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingAllDomains( getState() ) ) {
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
