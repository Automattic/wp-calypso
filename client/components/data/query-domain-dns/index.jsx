import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDns } from 'calypso/state/domains/dns/actions';

export default function QueryDomainDns( { domain } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( fetchDns( domain ) );
	}, [ dispatch, domain ] );

	return null;
}
