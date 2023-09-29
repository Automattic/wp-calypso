import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';

export default function useDomainQueryParam( sanitize = true ) {
	const [ domain, setDomain ] = useState( '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const queryParams = useQuery();

	useEffect( () => {
		const _domain = ( queryParams.get( 'domain' ) || '' ).trim();

		try {
			if ( _domain ) {
				// Only allow domains with a dot in them (not localhost, for example).
				if ( ! _domain.includes( '.' ) ) {
					throw new Error( 'Invalid domain' );
				}

				let normalised = _domain;

				// If the domain doesn't start with http:// or https://, add https://
				if ( ! normalised.startsWith( 'http://' ) && ! normalised.startsWith( 'https://' ) ) {
					normalised = 'https://' + normalised;
				}

				// Test if we can parse the URL. If we can't, it's invalid.
				const url = new URL( normalised );

				// Check if the protocol is 'http' or 'https'.
				setIsValid( url.protocol === 'http:' || url.protocol === 'https:' );
			} else {
				setIsValid( undefined );
			}
		} catch ( e ) {
			setIsValid( false );
		}

		setDomain( sanitize ? getFixedDomainSearch( extractDomainFromInput( _domain ) ) : _domain );
	}, [ queryParams ] );

	return { domain, isValid };
}
