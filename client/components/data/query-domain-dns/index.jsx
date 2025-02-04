import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDns } from 'calypso/state/domains/dns/actions';

export default function QueryDomainDns( { domain, forceReload = false } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( fetchDns( domain, forceReload ) );
	}, [ dispatch, domain ] );

	return null;
}
