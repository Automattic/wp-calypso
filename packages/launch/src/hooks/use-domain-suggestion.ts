import { DomainSuggestions } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { useDomainSearch } from './';

export function useDomainSuggestion(): DomainSuggestions.DomainSuggestion | undefined {
	const locale = useLocale();
	const { domainSearch } = useDomainSearch();

	const suggestion = useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < 2 ) {
				return;
			}
			return select( DomainSuggestions.store ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: false,
				include_dotblogsubdomain: false,
				quantity: 1, // this will give the recommended domain only
				locale,
			} );
		},
		[ domainSearch, locale ]
	)?.[ 0 ];

	return suggestion;
}
