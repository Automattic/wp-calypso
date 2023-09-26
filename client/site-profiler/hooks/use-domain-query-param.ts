import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';

export default function useDomainQueryParam( sanitize = true ) {
	const [ domain, setDomain ] = useState( '' );
	const queryParams = useQuery();

	useEffect( () => {
		setDomain(
			sanitize
				? getFixedDomainSearch( extractDomainFromInput( queryParams.get( 'domain' ) || '' ) )
				: domain
		);
	}, [ queryParams ] );

	return domain;
}
