import { useQuery } from '@tanstack/react-query';
import { useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestionPrice as DomainSuggestionPriceComponent } from '../../ui';
export interface DomainSuggestionPriceProps {
	domainName: string;
}

export const DomainSuggestionPrice = ( { domainName }: DomainSuggestionPriceProps ) => {
	const { queries } = useDomainSearch();
	const suggestion = useSuggestion( domainName );
	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );

	const priceSource = suggestion.is_premium && availability ? availability : suggestion;

	return (
		<DomainSuggestionPriceComponent
			salePrice={ priceSource.sale_cost }
			price={ priceSource.cost }
			renewPrice={ priceSource.renew_cost }
		/>
	);
};
