import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';

export default function useDomainQueryParam( sanitize = true ) {
	const [ domain, setDomain ] = useState( '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const queryParams = useQuery();

	useEffect( () => {
		const _domain = queryParams.get( 'domain' ) || '';
		const urlPattern = /^(https?:\/\/)?([a-z0-9-]+(\.[a-z0-9-]+)+(:\d{2,5})?(\/[^\s]*)?)$/i;

		setIsValid( _domain ? urlPattern.test( _domain ) : undefined );
		setDomain( sanitize ? getFixedDomainSearch( extractDomainFromInput( _domain ) ) : _domain );
	}, [ queryParams ] );

	return { domain, isValid };
}
