/**
 * External dependencies
 */
import { useDebounce } from 'use-debounce';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { DOMAIN_SUGGESTION_VENDOR, PAID_DOMAINS_TO_SHOW, selectorDebounce } from '../constants';
import { useCurrentStep } from '../path';
import { domainTldsByCategory } from '../domains-constants';

export function useDomainSuggestions( {
	searchOverride = '',
	locale = 'en',
	quantity = PAID_DOMAINS_TO_SHOW,
} ) {
	const { __ } = useI18n();
	const { siteTitle, siteVertical, domainSearch, domainCategory } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const currentStep = useCurrentStep();
	const prioritisedSearch = searchOverride.trim() || domainSearch.trim() || siteTitle;
	let searchVal;

	if ( currentStep !== 'IntentGathering' ) {
		searchVal =
			prioritisedSearch ||
			siteVertical?.label.trim() ||
			currentUser?.username ||
			__( 'My new site' );
	} else {
		searchVal = prioritisedSearch || '';
	}

	const [ searchTerm ] = useDebounce( searchVal, selectorDebounce );

	const tlds = domainCategory && domainTldsByCategory[ domainCategory ];

	return useSelect(
		( select ) => {
			if ( ! searchTerm ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( searchTerm, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity,
				locale,
				vendor: DOMAIN_SUGGESTION_VENDOR,
				...( siteVertical && { vertical: siteVertical?.id } ),
				...( tlds && { tlds } ),
			} );
		},
		[ searchTerm, siteVertical, tlds, quantity ]
	);
}
