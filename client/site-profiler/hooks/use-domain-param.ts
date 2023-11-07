import { useEffect, useState } from 'react';
import { extractDomainFromInput, getFixedDomainSearch } from 'calypso/lib/domains';
import {
	SPECIAL_DOMAIN_CATEGORY,
	getDomainCategory,
} from 'calypso/site-profiler/utils/get-domain-category';
import validateDomain from 'calypso/site-profiler/utils/validate-domain';
import isSpecialDomain, { prepareSpecialDomain } from '../utils/is-special-domain';

export default function useDomainParam( value = '' ) {
	const [ domain, setDomain ] = useState( value );
	const [ rawDomain, setRawDomain ] = useState( value );
	const [ isValid, setIsValid ] = useState< undefined | boolean >();
	const [ isSpecial, setIsSpecial ] = useState( isSpecialDomain( value ) );
	const [ category, setCategory ] = useState< SPECIAL_DOMAIN_CATEGORY >();
	const [ readyForDataFetch, setReadyForDataFetch ] = useState( false );

	useEffect( () => {
		const isSpecialDomainValue = isSpecialDomain( value );
		const isValidDomainValue = validateDomain( value );
		// check if domain is special before preparing domain value
		setIsSpecial( isSpecialDomainValue );
		setIsValid( isValidDomainValue );

		if ( value && ! isSpecialDomainValue && ! isValidDomainValue ) {
			return;
		}

		const preparedDomain = prepareDomain( value, isSpecial );
		const preparedRawDomain = prepareRawDomain( value );

		setCategory( getDomainCategory( preparedDomain ) );
		setDomain( preparedDomain );
		setRawDomain( preparedRawDomain );
		setReadyForDataFetch( ! isSpecial && !! domain && !! isValid );
	}, [ value, rawDomain, isSpecial, isValid, domain ] );

	return { domain, rawDomain, isValid, isSpecial, category, readyForDataFetch };
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

function prepareRawDomain( domain: string ) {
	if ( ! domain ) {
		return '';
	}

	return decodeURIComponent( domain.toLowerCase() );
}
