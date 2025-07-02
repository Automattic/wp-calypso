import {
	Card,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	CardBody,
	__experimentalText as Text,
} from '@wordpress/components';
import { Domain } from '../DomainSearch/types';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionPrice } from '../domain-suggestion-price';

import './style.scss';

interface DomainSuggestionProps {
	domain: Domain;
}

export const DomainSuggestionsRecommendation = ( { domain }: DomainSuggestionProps ) => {
	return (
		<Card className="domain-suggestions-recommendation">
			<CardBody className="domain-suggestions-recommendation__body">
				<VStack spacing={ 4 } className="domain-suggestions-recommendation__body-content">
					<VStack spacing={ 2 } alignment="start">
						{ domain.badges?.map( ( badge ) => (
							<DomainSuggestionBadge key={ badge } badge={ badge } />
						) ) }
						<Text size="largeTitle">
							{ domain.domain }.{ domain.tld }
						</Text>
					</VStack>
					<HStack alignment="bottom" justify="space-between">
						<div className="domain-suggestions-recommendation__price">
							<DomainSuggestionPrice
								originalPrice={ domain.originalPrice }
								price={ domain.price }
							/>
						</div>
						<DomainSuggestionCTA domain={ domain } />
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
};
