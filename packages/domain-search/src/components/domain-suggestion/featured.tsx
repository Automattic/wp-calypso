import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { cloneElement, ComponentProps, useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';
import { DomainSuggestionPrice } from '../domain-suggestion-price';

import './featured.scss';

type DomainSuggestionFeaturedProps = {
	uuid: string;
	domain: string;
	tld: string;
	matchReasons?: string[];
	badges?: React.ReactNode;
	price: React.ReactElement< ComponentProps< typeof DomainSuggestionPrice > >;
	isHighlighted?: boolean;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

export const Featured = ( {
	uuid,
	domain,
	tld,
	matchReasons,
	badges,
	price,
	isHighlighted,
	onClick,
	disabled,
}: DomainSuggestionFeaturedProps ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	const contextValue = useMemo( () => ( { activeQuery } ), [ activeQuery ] );

	const cta = <DomainSuggestionCTA onClick={ onClick } disabled={ disabled } uuid={ uuid } />;

	const title = (
		<Text size={ activeQuery === 'large' ? 32 : 24 }>
			{ domain }.{ tld }
		</Text>
	);

	const badgesElement = badges && (
		<div className="domain-suggestion-featured__badges">{ badges }</div>
	);

	const matchReasonsList = matchReasons && (
		<DomainSuggestionMatchReasons reasons={ matchReasons } />
	);

	// There's something to be improved here. The consumer shouldn't be wrangling the alignment, but at the same time this feels hacky.
	const priceElement = ! matchReasonsList
		? cloneElement( price, { ...price.props, alignment: 'left' } )
		: price;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			if ( matchReasonsList ) {
				return (
					<HStack spacing={ 6 }>
						<VStack spacing={ 3 } alignment="left">
							{ badgesElement }
							{ title }
							{ matchReasonsList }
						</VStack>
						<VStack
							spacing={ 6 }
							alignment="right"
							className="domain-suggestion-featured__price-info"
						>
							{ priceElement }
							{ cta }
						</VStack>
					</HStack>
				);
			}

			return (
				<VStack spacing={ 3 }>
					<VStack spacing={ 3 } alignment="left">
						{ badgesElement }
						{ title }
					</VStack>
					<HStack>
						{ priceElement }
						{ cta }
					</HStack>
				</VStack>
			);
		}

		return (
			<VStack spacing={ 4 }>
				<VStack spacing={ 3 }>
					{ badgesElement }
					{ title }
					{ priceElement }
					{ matchReasonsList }
				</VStack>
				{ cta }
			</VStack>
		);
	};

	return (
		<Card
			ref={ containerRef }
			size={ activeQuery === 'large' ? 'medium' : 'small' }
			className={ clsx( 'domain-suggestion-featured', {
				'domain-suggestion-featured--highlighted': isHighlighted,
			} ) }
		>
			<DomainSuggestionContainerContext.Provider value={ contextValue }>
				<CardBody>{ getContent() }</CardBody>
			</DomainSuggestionContainerContext.Provider>
		</Card>
	);
};
