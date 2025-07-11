import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

interface DomainSuggestionPriceProps {
	originalPrice?: string;
	price: string;
	alignment?: 'left' | 'right';
}

export const DomainSuggestionPrice = ( {
	originalPrice,
	price,
	alignment = 'left',
}: DomainSuggestionPriceProps ) => {
	const { __ } = useI18n();

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
						<Text>{ __( '/year' ) }</Text>
					</HStack>
				) }
			</HStack>
			{ originalPrice && (
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
