import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';

interface DomainSuggestionPriceProps {
	originalPrice?: string;
	price: string;
	renewsAnually?: boolean;
}

export const DomainSuggestionPrice = ( {
	originalPrice,
	price,
	renewsAnually = true,
}: DomainSuggestionPriceProps ) => {
	const { __ } = useI18n();
	const listContext = useDomainSuggestionsListContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestionPrice must be used within a DomainSuggestionsList' );
	}

	const alignment = listContext.activeQuery === 'large' ? 'right' : 'left';

	return (
		<VStack spacing={ 0 }>
			<HStack spacing={ 2 } justify={ alignment === 'left' ? 'start' : 'end' }>
				{ originalPrice ? (
					<>
						<Text size={ 18 } variant="muted" style={ { textDecoration: 'line-through' } }>
							{ originalPrice }
						</Text>
						<Text size={ 18 } color="var( --domain-search-promotional-price-color )">
							{ price }
						</Text>
					</>
				) : (
					<HStack spacing={ 1 } alignment="left">
						<Text size={ 18 }>{ price }</Text>
						{ renewsAnually && <Text>{ __( '/year' ) }</Text> }
					</HStack>
				) }
			</HStack>
			{ originalPrice && renewsAnually && (
				<Text size="body" align={ alignment }>
					{ sprintf(
						// translators: %(price)s is the price of the domain.
						__( 'For first year. %(price)s/year renewal.' ),
						{ price: originalPrice }
					) }
				</Text>
			) }
		</VStack>
	);
};
