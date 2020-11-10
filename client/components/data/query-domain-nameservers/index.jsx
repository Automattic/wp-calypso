/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchNameservers } from 'calypso/state/domains/nameservers/actions';

export default function QueryDomainNameservers( { domainName } ) {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( fetchNameservers( domainName ) );
	}, [ dispatch, domainName ] );

	return null;
}
