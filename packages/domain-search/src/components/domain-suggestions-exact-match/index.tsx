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
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
interface DomainSuggestionProps {
	domain: Domain;
}

export const DomainSuggestionsExactMatch = ( { domain }: DomainSuggestionProps ) => {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<VStack spacing={ 2 } alignment="start">
						{ domain.badges?.map( ( badge ) => (
							<DomainSuggestionBadge key={ badge } badge={ badge } />
						) ) }
						<HStack>
							<Text size="largeTitle">
								{ domain.domain }.{ domain.tld }
							</Text>
							<DomainSuggestionPrice
								originalPrice={ domain.originalPrice }
								price={ domain.price }
							/>
						</HStack>
					</VStack>
					<HStack alignment="bottom" justify="space-between">
						{ domain.matchReasons && domain.matchReasons.length > 0 && (
							<DomainSuggestionMatchReasons
								matchReasons={ domain.matchReasons }
								tld={ domain.tld }
							/>
						) }
						<DomainSuggestionCTA domain={ domain } />
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
};
