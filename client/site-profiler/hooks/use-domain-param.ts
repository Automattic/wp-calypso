import { useEffect, useState, useCallback } from 'react';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';
import {
	SPECIAL_DOMAIN_CATEGORY,
	getDomainCategory,
} from 'calypso/site-profiler/utils/get-domain-category';
import validateDomain from 'calypso/site-profiler/utils/validate-domain';
import isSpecialDomain from '../utils/is-special-domain';

export default function useDomainParam( value?: string, sanitize = true ) {
	const [ domain, setDomain ] = useState( value || '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const [ isSpecial, setIsSpecial ] = useState< undefined | boolean >();
	const [ specialDomainMapping, setSpecialDomainMapping ] = useState< SPECIAL_DOMAIN_CATEGORY >();
	const isDomainSpecialInput = isSpecialDomain( domain );

	const getFinalizedDomain = useCallback(
		( _domain: string ) => {
			const domain_lc = _domain.toLowerCase();
			if ( isSpecial ) {
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
		[ isSpecial, sanitize ]
	);

	useEffect( () => {
		setIsValid( validateDomain( value || '' ) );
		const finalizedDomain = getFinalizedDomain( value || '' );
		const specialDomains = getDomainCategory( finalizedDomain );
		setSpecialDomainMapping( specialDomains );
		setDomain( finalizedDomain );
		setIsSpecial( isSpecialDomain( value || '' ) );
	}, [ value, getFinalizedDomain, isDomainSpecialInput ] );

	return { domain, isValid, isSpecial, specialDomainMapping };
}
