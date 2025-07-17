import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';
import type { ReactNode } from 'react';

import './style.scss';

interface DomainSuggestionPriceProps {
	originalPrice?: string;
	price: string;
	renewsAnually?: boolean;
	subText?: ReactNode;
}

export const DomainSuggestionPrice = ( {
	originalPrice,
	price,
	renewsAnually = true,
	subText: subTextProp,
}: DomainSuggestionPriceProps ) => {
	const { __ } = useI18n();
	const listContext = useDomainSuggestionsListContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestionPrice must be used within a DomainSuggestionsList' );
	}

	const alignment = listContext.activeQuery === 'large' ? 'right' : 'left';

	const getSubText = () => {
		if ( subTextProp ) {
			return subTextProp;
		}

		if ( originalPrice && renewsAnually ) {
			return sprintf(
				// translators: %(price)s is the price of the domain.
				__( 'For first year. %(price)s/year renewal.' ),
				{ price: originalPrice }
			);
		}

		return null;
	};

	const subText = getSubText();

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
					<HStack
						spacing={ 1 }
						alignment={ listContext.activeQuery === 'large' ? 'right' : 'left' }
					>
						<Text size={ 18 }>{ price }</Text>
						{ renewsAnually && <Text>{ __( '/year' ) }</Text> }
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
