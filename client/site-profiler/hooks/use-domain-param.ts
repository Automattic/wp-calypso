import { useEffect, useState } from 'react';
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
	const [ isSpecial, setIsSpecial ] = useState( isSpecialDomain( value || '' ) );
	const [ category, setCategory ] = useState< SPECIAL_DOMAIN_CATEGORY >();

	useEffect( () => {
		const finalizedDomain = prepareDomain( value || '', isSpecial );

		setDomain( finalizedDomain );
		setCategory( getDomainCategory( finalizedDomain ) );
		setIsValid( validateDomain( value || '' ) );
		setIsSpecial( isSpecialDomain( value || '' ) );
	}, [ value ] );

	return { domain, isValid, isSpecial, category };
}

function prepareDomain( domain: string, isSpecial: boolean ) {
	if ( ! domain ) {
		return '';
	}

	const domain_lc = domain.toLowerCase();

	return isSpecial
		? prepareSpecialDomain( domain_lc )
		: getFixedDomainSearch( extractDomainFromInput( domain_lc ) );
}
