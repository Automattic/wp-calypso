import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { globe, Icon } from '@wordpress/icons';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';
import { Unavailable } from './unavailable';

interface DomainSuggestionsListItemProps {
	domainUuid: string;
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
}

export const DomainSuggestionsListItem = ( {
	domainUuid,
	domain,
	tld,
	originalPrice,
	price,
}: DomainSuggestionsListItemProps ) => {
	const { activeQuery } = useDomainSuggestionsListContext();

	const domainName = (
		<Text>
			{ domain }
			<Text weight={ 500 }>.{ tld }</Text>
		</Text>
	);

	const cta = <DomainSuggestionCTA compact domainUuid={ domainUuid } />;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<HStack spacing={ 3 }>
					<HStack alignment="left">
						<Icon icon={ globe } size={ 24 } />
						{ domainName }
					</HStack>

					<HStack alignment="right" spacing={ 4 }>
						<DomainSuggestionPrice
							alignment="right"
							originalPrice={ originalPrice }
							price={ price }
						/>
						{ cta }
					</HStack>
				</HStack>
			);
		}

		return (
			<HStack spacing={ 4 }>
				<VStack spacing={ 2 }>
					{ domainName }
					<DomainSuggestionPrice originalPrice={ originalPrice } price={ price } />
				</VStack>
				{ cta }
			</HStack>
		);
	};

	return (
		<Card>
			<CardBody>{ getContent() }</CardBody>
		</Card>
	);
};

DomainSuggestionsListItem.Unavailable = Unavailable;
