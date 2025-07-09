import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

export const DomainSuggestionPrice = ( {
	originalPrice,
	price,
	alignment = 'left',
}: {
	originalPrice?: string;
	price: string;
	alignment?: 'left' | 'right';
} ) => {
	const { __ } = useI18n();

	return (
		<VStack spacing={ 0 }>
			<HStack spacing={ 2 } justify={ alignment === 'left' ? 'start' : 'end' }>
				{ originalPrice ? (
					<>
						<Text size="title" variant="muted" style={ { textDecoration: 'line-through' } }>
							{ originalPrice }
						</Text>
						<Text size="title" color="green">
							{ price }
						</Text>
					</>
				) : (
					<HStack spacing={ 1 } alignment="baseline">
						<Text size="title">{ price }</Text>
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
