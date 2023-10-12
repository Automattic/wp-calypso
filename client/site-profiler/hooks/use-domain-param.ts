import { useEffect, useState } from 'react';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';
import {
	SPECIAL_DOMAIN_CATEGORY,
	getDomainCategory,
} from 'calypso/site-profiler/utils/get-domain-category';
import trimDomain from 'calypso/site-profiler/utils/trim-domain';
import validateDomain from 'calypso/site-profiler/utils/validate-domain';
import isSpecialDomain, { prepareSpecialDomain } from '../utils/is-special-domain';

export default function useDomainParam( value = '' ) {
	const trimmedDomain = trimDomain( value );
	const [ domain, setDomain ] = useState( trimmedDomain );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const [ isSpecial, setIsSpecial ] = useState( isSpecialDomain( trimmedDomain ) );
	const [ category, setCategory ] = useState< SPECIAL_DOMAIN_CATEGORY >();
	const [ readyForDataFetch, setReadyForDataFetch ] = useState( false );

	useEffect( () => {
		const preparedDomain = prepareDomain( trimmedDomain, isSpecial );

		// check if domain is special before preparing domain value
		setIsSpecial( isSpecialDomain( trimmedDomain ) );
		setIsValid( validateDomain( preparedDomain ) );
		setCategory( getDomainCategory( preparedDomain ) );
		setDomain( preparedDomain );
		setReadyForDataFetch( ! isSpecial && !! domain && !! isValid );
	}, [ trimmedDomain, isSpecial, isValid ] );

	return { domain, isValid, isSpecial, category, readyForDataFetch };
}

function prepareDomain( domain: string, isSpecial: boolean ) {
	if ( ! domain ) {
		return '';
	}

	const domainLc = domain.toLowerCase();

	return isSpecial
		? prepareSpecialDomain( domainLc )
		: getFixedDomainSearch( extractDomainFromInput( domainLc ) );
}
