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

import './style.scss';

interface DomainSuggestionsListItemProps {
	domainUuid: string;
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
	badges?: React.ReactNode[];
}

export const DomainSuggestionsListItem = ( {
	domainUuid,
	domain,
	tld,
	originalPrice,
	price,
	badges,
}: DomainSuggestionsListItemProps ) => {
	const { activeQuery } = useDomainSuggestionsListContext();

	const domainName = (
		<Text size={ activeQuery === 'large' ? 18 : 16 }>
			{ domain }
			<Text
				size="inherit"
				weight={ 500 }
				style={ { marginRight: badges?.length ? '12px' : undefined } }
			>
				.{ tld }
			</Text>
			{ badges?.length && <span className="domain-suggestions-list-item__badges">{ badges }</span> }
		</Text>
	);

	const cta = <DomainSuggestionCTA compact domainUuid={ domainUuid } />;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<HStack spacing={ 3 }>
					<HStack alignment="left" spacing={ 3 }>
						<Icon icon={ globe } size={ 24 } style={ { flexShrink: 0 } } />
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
		<Card isBorderless size={ activeQuery === 'large' ? 'medium' : 'small' }>
			<CardBody>{ getContent() }</CardBody>
		</Card>
	);
};

DomainSuggestionsListItem.Unavailable = Unavailable;
