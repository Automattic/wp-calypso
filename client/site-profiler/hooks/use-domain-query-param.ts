import { useEffect, useState } from 'react';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';

export default function useDomainQueryParam( sanitize = true ) {
	const [ domain, setDomain ] = useState( '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const queryParams = useQuery();

	useEffect( () => {
		const _domain = queryParams.get( 'domain' ) || '';

		setIsValid( _domain ? CAPTURE_URL_RGX.test( _domain ) : undefined );

		setDomain( sanitize ? getFixedDomainSearch( extractDomainFromInput( _domain ) ) : _domain );
	}, [ queryParams ] );

	return { domain, isValid };
}
