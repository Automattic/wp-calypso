import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { ComponentProps, useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';

import './recommended.scss';

type DomainSuggestionRecommendedProps = {
	uuid: string;
	domain: string;
	tld: string;
	badges: React.ReactNode;
	price: React.ReactNode;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

export const Recommended = ( {
	uuid,
	domain,
	tld,
	badges,
	price,
	onClick,
	disabled,
}: DomainSuggestionRecommendedProps ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	const contextValue = useMemo( () => ( { activeQuery } ), [ activeQuery ] );

	const cta = <DomainSuggestionCTA onClick={ onClick } disabled={ disabled } uuid={ uuid } />;

	const title = (
		<Text size={ activeQuery === 'large' ? 32 : 24 }>
			{ domain }.{ tld }
		</Text>
	);

	const badgesElement = <div className="domain-suggestion-recommended__badges">{ badges }</div>;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<VStack spacing={ 3 }>
					<VStack spacing={ 3 } alignment="left">
						{ badgesElement }
						{ title }
					</VStack>
					<HStack>
						{ price }
						{ cta }
					</HStack>
				</VStack>
			);
		}

		return (
			<VStack spacing={ 3 }>
				{ badgesElement }
				{ title }
				{ price }
				{ cta }
			</VStack>
		);
	};

	return (
		<Card
			ref={ containerRef }
			size={ activeQuery === 'large' ? 'medium' : 'small' }
			className="domain-suggestion-recommended--fqdn"
		>
			<DomainSuggestionContainerContext.Provider value={ contextValue }>
				<CardBody>{ getContent() }</CardBody>
			</DomainSuggestionContainerContext.Provider>
		</Card>
	);
};
