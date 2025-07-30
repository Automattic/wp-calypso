import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';

import './style.scss';

interface DomainSuggestionPriceProps {
	salePrice?: string;
	price: string;
	renewPrice?: string;
}

export const DomainSuggestionPrice = ( {
	salePrice,
	price,
	renewPrice,
}: DomainSuggestionPriceProps ) => {
	const { __ } = useI18n();
	const containerContext = useDomainSuggestionContainerContext();

	if ( ! containerContext ) {
		throw new Error( 'DomainSuggestionPrice must be used within a DomainSuggestionsList' );
	}

	const alignment =
		containerContext.alignment ?? ( containerContext.activeQuery === 'large' ? 'right' : 'left' );

	const getPriceSize = () => {
		if ( containerContext.priceSize ) {
			return containerContext.priceSize;
		}

		return 18;
	};

	const priceSize = getPriceSize();

	const getSubText = () => {
		if ( ! renewPrice ) {
			return null;
		}

		if ( ! salePrice && renewPrice === price ) {
			return null;
		}

		return sprintf(
			// translators: %(price)s is the price of the domain.
			__( 'For first year. %(price)s/year renewal.' ),
			{ price: renewPrice }
		);
	};

	const subText = getSubText();

	return (
		<VStack spacing={ 0 }>
			<HStack spacing={ 2 } justify={ alignment === 'left' ? 'start' : 'end' }>
				{ salePrice ? (
					<>
						<Text size={ priceSize } variant="muted" style={ { textDecoration: 'line-through' } }>
							{ price }
						</Text>
						<Text size={ priceSize } color="var( --domain-search-promotional-price-color )">
							{ salePrice }
						</Text>
					</>
				) : (
					<HStack spacing={ 1 } alignment={ alignment }>
						<Text size={ priceSize }>{ price }</Text>
						{ renewPrice && renewPrice === price && <Text>{ __( '/year' ) }</Text> }
					</HStack>
				) }
			</HStack>
			{ subText && (
				<Text size="body" align={ alignment } className="domain-suggestion-price__sub-text">
					{ subText }
				</Text>
			) }
		</VStack>
	);
};
