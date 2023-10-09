import { useEffect, useState, useCallback } from 'react';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';
import {
	isSpecialInput,
	SPECIAL_DOMAIN_CASES,
	getSpecialDomainMapping,
} from 'calypso/site-profiler/utils/get-special-domain-mapping';
import validateDomain from 'calypso/site-profiler/utils/validate-domain';

export default function useDomainParam( value?: string, sanitize = true ) {
	const [ domain, setDomain ] = useState( value || '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const [ specialDomainMapping, setSpecialDomainMapping ] = useState< SPECIAL_DOMAIN_CASES >();
	const isDomainSpecialInput = isSpecialInput( domain );

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
		setIsValid( validateDomain( value || '' ) );
		const finalizedDomain = getFinalizedDomain( value || '' );
		const specialDomains = getSpecialDomainMapping( finalizedDomain );
		setSpecialDomainMapping( specialDomains );
		setDomain( finalizedDomain );
	}, [ value, getFinalizedDomain, isDomainSpecialInput ] );

	return { domain, isValid, specialDomainMapping, isDomainSpecialInput };
}
