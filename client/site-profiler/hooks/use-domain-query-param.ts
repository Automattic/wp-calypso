import { useEffect, useState, useCallback } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';
import {
	isSpecialInput,
	SPECIAL_DOMAIN_CASES,
	getSpecialDomainMapping,
} from 'calypso/site-profiler/utils/get-special-domain-mapping';

export default function useDomainQueryParam( sanitize = true ) {
	const [ domain, setDomain ] = useState( '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const [ specialDomainMapping, setSpecialDomainMapping ] = useState< SPECIAL_DOMAIN_CASES >();
	const queryParams = useQuery();
	const _domain = ( queryParams.get( 'domain' ) || '' ).trim();
	const isDomainSpecialInput = isSpecialInput( _domain );

	const getFinalizedDomain = useCallback(
		( _domain: string ) => {
			const domain_lc = _domain.toLowerCase();
			if ( isDomainSpecialInput ) {
				if ( domain_lc.includes( 'wordpress.com/site-profiler' ) ) {
					return 'wordpress.com/site-profiler';
				} else if ( domain_lc.includes( 'localhost' ) ) {
					return 'localhost';
				} else if ( domain_lc.includes( '127.0.0.1' ) ) {
					return '127.0.0.1';
				}
			}
			return sanitize ? getFixedDomainSearch( extractDomainFromInput( domain_lc ) ) : domain_lc;
		},
		[ isDomainSpecialInput, sanitize ]
	);

	useEffect( () => {
		try {
			if ( _domain ) {
				// Only allow domains with a dot in them (not localhost, for example).
				if ( ! _domain.includes( '.' ) || isDomainSpecialInput ) {
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
		const finalizedDomain = getFinalizedDomain( _domain );
		const specialDomains = getSpecialDomainMapping( finalizedDomain );
		setSpecialDomainMapping( specialDomains );
		setDomain( finalizedDomain );
	}, [ _domain, getFinalizedDomain, isDomainSpecialInput ] );

	return { domain, isValid, specialDomainMapping, isDomainSpecialInput };
}
