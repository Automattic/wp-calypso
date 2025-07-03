import {
	Card,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	CardBody,
	__experimentalText as Text,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useState } from 'react';
import { Domain } from '../DomainSearch/types';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';
import { DomainSuggestionPrice } from '../domain-suggestion-price';
interface DomainSuggestionProps {
	domain: Domain;
}

export const DomainSuggestionsExactMatch = ( { domain }: DomainSuggestionProps ) => {
	const [ isSmallLayout, setIsSmallLayout ] = useState( false );

	const containerRef = useResizeObserver( ( entries ) => {
		setIsSmallLayout( entries[ 0 ].contentRect.width <= 480 );
	} );

	const badges = domain.badges?.map( ( badge ) => (
		<DomainSuggestionBadge key={ badge } badge={ badge } />
	) );

	const domainName = (
		<Text size="largeTitle">
			{ domain.domain }.{ domain.tld }
		</Text>
	);

	const price = (
		<DomainSuggestionPrice originalPrice={ domain.originalPrice } price={ domain.price } />
	);

	const matchReasons = domain.matchReasons && domain.matchReasons.length > 0 && (
		<DomainSuggestionMatchReasons matchReasons={ domain.matchReasons } tld={ domain.tld } />
	);

	const cta = <DomainSuggestionCTA domain={ domain } />;

	const getContent = () => {
		if ( isSmallLayout ) {
			return (
				<VStack spacing={ 4 }>
					<VStack spacing={ 3 } alignment="start">
						{ badges }
						{ domainName }
						{ price }
						{ matchReasons }
					</VStack>
					{ cta }
				</VStack>
			);
		}

		return (
			<VStack spacing={ 4 }>
				<VStack spacing={ 2 } alignment="start">
					{ badges }
					<HStack>
						{ domainName }
						{ price }
					</HStack>
				</VStack>
				<HStack alignment="bottom" justify="space-between">
					{ matchReasons }
					{ cta }
				</HStack>
			</VStack>
		);
	};

	return (
		<Card ref={ containerRef } style={ { width: '100%' } }>
			<CardBody>{ getContent() }</CardBody>
		</Card>
	);
};
