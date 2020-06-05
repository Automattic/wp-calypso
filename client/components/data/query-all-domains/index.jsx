/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getAllDomainsRequest } from 'state/all-domains/actions';
import isRequestingAllDomains from 'state/selectors/is-requesting-all-domains';

const request = () => ( dispatch, getState ) => {
	if ( ! isRequestingAllDomains( getState() ) ) {
		dispatch( getAllDomainsRequest() );
	}
};

export default function QueryAllDomains() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}
