import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { useQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';
import { DomainSuggestionPrice } from '../suggestion-price';

interface SearchResultsItemProps {
	domainName: string;
}

export const SearchResultsItem = ( { domainName }: SearchResultsItemProps ) => {
	const [ domain, ...tlds ] = domainName.split( '.' );

	const suggestion = useSuggestion( domainName );
	const suggestionBadges = useDomainSuggestionBadges( domainName );

	const { queries } = useDomainSearch();
	const { data: products } = useQuery( queries.products() );

	const tld = tlds.join( '.' );

	const notice = useMemo( () => {
		const isHstsRequired = products?.[ suggestion.product_slug ]?.is_hsts_required ?? false;

		if ( isHstsRequired ) {
			return createInterpolateElement(
				sprintf(
					/* translators: %s is the TLD of the domain */
					__(
						'All domains ending in <strong>%(tld)s</strong> require an SSL certificate to host a website. When you host this domain at WordPress.com an SSL certificate is included. <a>Learn more</a>.'
					),
					{
						tld: `.${ tld }`,
					}
				),
				{
					a: <a href={ localizeUrl( HTTPS_SSL ) } target="_blank" rel="noopener noreferrer" />,
					strong: <strong />,
				}
			);
		}

		const isDotGayNoticeRequired =
			products?.[ suggestion.product_slug ]?.is_dot_gay_notice_required ?? false;

		if ( isDotGayNoticeRequired ) {
			return __(
				'Any anti-LGBTQ content is prohibited and can result in registration termination. The registry will donate 20% of all registration revenue to LGBTQ non-profit organizations.'
			);
		}

		return null;
	}, [ suggestion, products, tld ] );

	return (
		<DomainSuggestion
			badges={ suggestionBadges.length > 0 ? suggestionBadges : undefined }
			notice={ notice }
			domain={ domain }
			tld={ tld }
			price={ <DomainSuggestionPrice domainName={ domainName } /> }
			cta={ <DomainSuggestionCTA domainName={ domainName } /> }
		/>
	);
};
