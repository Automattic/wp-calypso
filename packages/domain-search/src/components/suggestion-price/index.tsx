import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { DomainPriceRule, useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestionPrice as DomainSuggestionPriceComponent } from '../../ui';
export interface DomainSuggestionPriceProps {
	domainName: string;
}

export const DomainSuggestionPrice = ( { domainName }: DomainSuggestionPriceProps ) => {
	const { queries } = useDomainSearch();
	const suggestion = useSuggestion( domainName );
	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );

	const priceSource = availability ?? suggestion;

	// The availability endpoint returns a number, but the suggestion endpoint returns a string.
	// We need to format it manually in this case.
	const saleCost =
		typeof priceSource.sale_cost === 'number'
			? formatCurrency( priceSource.sale_cost, priceSource.currency_code, {
					stripZeros: true,
			  } )
			: priceSource.sale_cost;

	if ( suggestion.price_rule === DomainPriceRule.HIDE_PRICE ) {
		return null;
	}

	if ( suggestion.price_rule === DomainPriceRule.ONE_TIME_PRICE ) {
		return <DomainSuggestionPriceComponent price={ priceSource.cost } />;
	}

	if ( suggestion.price_rule === DomainPriceRule.DOMAIN_MOVE_PRICE ) {
		return <DomainSuggestionPriceComponent price={ __( 'Move your existing domain' ) } />;
	}

	if ( suggestion.price_rule === DomainPriceRule.FREE_FOR_FIRST_YEAR ) {
		const zeroCost = formatCurrency( 0, priceSource.currency_code, {
			stripZeros: true,
		} );

		return (
			<DomainSuggestionPriceComponent
				price={ priceSource.cost }
				salePrice={ zeroCost }
				renewPrice={ priceSource.renew_cost }
			/>
		);
	}

	return (
		<DomainSuggestionPriceComponent
			salePrice={ saleCost }
			price={ priceSource.cost }
			renewPrice={ priceSource.renew_cost }
		/>
	);
};
