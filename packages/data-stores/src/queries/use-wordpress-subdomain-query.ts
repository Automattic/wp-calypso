import { useDomainSuggestionsQuery } from './use-domain-suggestions-query';

/**
 * Returns the expected *.wordpress.com for a given domain name
 */
export function useWordPressSubdomainQuery( paidDomainName?: string | null ) {
	return useDomainSuggestionsQuery( paidDomainName, {
		quantity: 1,
		include_wordpressdotcom: true,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		vendor: 'dot',
	} );
}
