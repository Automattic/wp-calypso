import { useEffect, useState, useCallback } from 'react';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';
import {
	SPECIAL_DOMAIN_CATEGORY,
	getDomainCategory,
} from 'calypso/site-profiler/utils/get-domain-category';
import validateDomain from 'calypso/site-profiler/utils/validate-domain';
import isSpecialDomain, { prepareSpecialDomain } from '../utils/is-special-domain';

export default function useDomainParam( value?: string ) {
	const [ domain, setDomain ] = useState( value || '' );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const [ isSpecial, setIsSpecial ] = useState< undefined | boolean >();
	const [ specialDomainMapping, setSpecialDomainMapping ] = useState< SPECIAL_DOMAIN_CATEGORY >();

	const getFinalizedDomain = useCallback(
		( _domain: string ) => {
			const domain_lc = _domain.toLowerCase();

			return isSpecial
				? prepareSpecialDomain( domain_lc )
				: getFixedDomainSearch( extractDomainFromInput( domain_lc ) );
		},
		[ isSpecial ]
	);

	useEffect( () => {
		const finalizedDomain = getFinalizedDomain( value || '' );
		const specialDomains = getDomainCategory( finalizedDomain );

		setDomain( finalizedDomain );
		setIsValid( validateDomain( value || '' ) );
		setIsSpecial( isSpecialDomain( value || '' ) );
		setSpecialDomainMapping( specialDomains );
	}, [ value, getFinalizedDomain ] );

	return { domain, isValid, isSpecial, specialDomainMapping };
}
